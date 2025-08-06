<template>
  <div class="audio-viewer" tabindex="0" @keydown="handleKeydown">
    <!-- 错误提示 -->
    <div v-if="hasError" class="error-banner">
      <ErrorCircleIcon class="error-icon" />
      <span>{{ errorMessage }}</span>
      <t-button variant="text" @click="retryLoad" class="retry-btn">重试</t-button>
    </div>

    <!-- 顶部信息栏 -->
    <div class="audio-header">
      <div class="audio-info">
        <PlayIcon v-if="isPlaying" class="status-icon" />
        <PauseIcon v-else class="status-icon" />
        <span class="audio-title">{{ currentAudio?.name || '未选择音频' }}</span>
        <div class="play-mode-icon">
          <RefreshIcon v-if="playMode === 'repeat'" class="mode-icon" />
          <RandomIcon v-if="playMode === 'shuffle'" class="mode-icon" />
          <Replay1Icon v-if="playMode === 'repeatOne'" class="mode-icon" />
        </div>
      </div>
    </div>

    <!-- 专辑封面区域 -->
    <div class="album-cover-container">
      <div class="album-cover" :class="{ spinning: isPlaying }">
        <MusicIcon class="default-cover-icon" />
      </div>
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
    </div>

    <!-- 播放控制区域 -->
    <div class="playback-controls">
      <t-button 
        variant="text" 
        size="large" 
        @click="previousTrack"
        :disabled="items.length <= 1"
        class="control-btn"
        title="上一首 (←)"
      >
        <BackwardIcon />
      </t-button>
      
      <t-button 
        variant="base" 
        size="large" 
        @click="togglePlay"
        class="play-btn"
        title="播放/暂停 (空格)"
      >
        <PlayIcon v-if="!isPlaying" />
        <PauseIcon v-else />
      </t-button>
      
      <t-button 
        variant="text" 
        size="large" 
        @click="nextTrack"
        :disabled="items.length <= 1"
        class="control-btn"
        title="下一首 (→)"
      >
        <ForwardIcon />
      </t-button>
    </div>

    <!-- 进度控制区域 -->
    <div class="progress-section">
      <span class="time-display">{{ formatTime(currentTime) }}</span>
      <t-slider
        v-model="progressValue"
        :min="0"
        :max="100"
        @change="onProgressChange"
        class="progress-slider"
        :disabled="!currentAudio"
      />
      <span class="time-display">{{ formatTime(duration) }}</span>
    </div>

    <!-- 音量控制区域 -->
    <div class="volume-section">
      <t-button variant="text" @click="toggleMute" class="volume-btn" title="静音 (M)">
        <SoundMuteIcon v-if="isMuted || volume === 0" />
        <SoundLowIcon v-else-if="volume < 50" />
        <SoundIcon v-else />
      </t-button>
      <t-slider
        v-model="volume"
        :min="0"
        :max="100"
        @change="onVolumeChange"
        class="volume-slider"
      />
      <span class="volume-text">{{ Math.round(volume) }}%</span>
    </div>

    <!-- 播放模式和播放列表控制 -->
    <div class="mode-controls">
      <t-button 
        variant="text" 
        @click="togglePlayMode" 
        class="mode-btn"
        :title="getPlayModeTitle()"
      >
        <RefreshIcon v-if="playMode === 'repeat'" />
        <RandomIcon v-if="playMode === 'shuffle'" />
        <Replay1Icon v-if="playMode === 'repeatOne'" />
      </t-button>
      <t-button 
        variant="text" 
        @click="togglePlaylist" 
        class="playlist-btn"
        title="播放列表 (L)"
      >
        <ListIcon />
      </t-button>
    </div>

    <!-- 播放列表 -->
    <div v-if="showPlaylist" class="playlist-container" @click="closePlaylistOnOverlay">
      <div class="playlist-content" @click.stop>
        <div class="playlist-header">
          <h3>播放列表 ({{ items.length }}首)</h3>
          <t-button variant="text" @click="togglePlaylist">
            <CloseIcon />
          </t-button>
        </div>
        <div class="playlist-items">
          <div
            v-for="(item, index) in items"
            :key="index"
            :class="['playlist-item', { active: index === currentIndex }]"
            @click="playTrack(index)"
            @dblclick="playTrack(index)"
          >
            <div class="item-info">
              <span class="item-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="item-name">{{ item.name }}</span>
              <PlayIcon v-if="index === currentIndex && isPlaying" class="playing-icon" />
              <PauseIcon v-else-if="index === currentIndex && !isPlaying" class="playing-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏的音频元素 -->
    <audio
      ref="audioElement"
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      @ended="onAudioEnded"
      @error="onAudioError"
      @loadstart="onLoadStart"
      @canplay="onCanPlay"
      preload="metadata"
    />
  </div>
</template>

<script setup lang="ts">
import { DirItem } from '@/apis/plugin/disk/list'
import MessageUtil from '@/utils/modal/MessageUtil'
import {
  PlayIcon,
  PauseIcon,
  BackwardIcon,
  ForwardIcon,
  SoundMuteIcon,
  SoundIcon,
  SoundLowIcon,
  RefreshIcon,
  RandomIcon,
  Replay1Icon,
  ListIcon,
  CloseIcon,
  MusicIcon,
  ErrorCircleIcon
} from 'tdesign-icons-vue-next'

// 类型定义
interface DirItemWrapper extends DirItem {
  url: string
}

type PlayMode = 'repeat' | 'shuffle' | 'repeatOne'
type SliderValue = number | number[]

// Props定义
interface Props {
  items: DirItemWrapper[]
  initialIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0
})

// 响应式数据
const audioElement = ref<HTMLAudioElement>()
const currentIndex = ref(props.initialIndex)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(80)
const isMuted = ref(false)
const playMode = ref<PlayMode>('repeat')
const showPlaylist = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const hasError = ref(false)
const lastVolume = ref(80)

// 计算属性
const currentAudio = computed(() => {
  return props.items[currentIndex.value] || null
})

const progressValue = computed({
  get: () => duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0,
  set: (value: number) => {
    if (audioElement.value && duration.value > 0) {
      const newTime = (value / 100) * duration.value
      audioElement.value.currentTime = newTime
      currentTime.value = newTime
    }
  }
})

// 方法定义
const showError = (message: string) => {
  hasError.value = true
  errorMessage.value = message
  MessageUtil.error(message)
}

const clearError = () => {
  hasError.value = false
  errorMessage.value = ''
}

const loadAudio = async () => {
  if (!audioElement.value || !currentAudio.value) return
  
  try {
    isLoading.value = true
    clearError()
    
    audioElement.value.src = currentAudio.value.url
    audioElement.value.load()
    
  } catch (error) {
    console.error('加载音频失败:', error)
    showError('音频加载失败，请检查文件路径')
  } finally {
    isLoading.value = false
  }
}

const retryLoad = () => {
  clearError()
  loadAudio()
}

const togglePlay = async () => {
  if (!audioElement.value || !currentAudio.value) return
  
  try {
    if (isPlaying.value) {
      audioElement.value.pause()
    } else {
      await audioElement.value.play()
    }
  } catch (error) {
    console.error('播放音频失败:', error)
    showError('音频播放失败，请检查文件格式')
  }
}

const previousTrack = () => {
  if (props.items.length <= 1) return
  
  if (playMode.value === 'shuffle') {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * props.items.length)
    } while (newIndex === currentIndex.value && props.items.length > 1)
    currentIndex.value = newIndex
  } else {
    currentIndex.value = currentIndex.value > 0 
      ? currentIndex.value - 1 
      : props.items.length - 1
  }
}

const nextTrack = () => {
  if (props.items.length <= 1) return
  
  if (playMode.value === 'shuffle') {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * props.items.length)
    } while (newIndex === currentIndex.value && props.items.length > 1)
    currentIndex.value = newIndex
  } else {
    currentIndex.value = currentIndex.value < props.items.length - 1 
      ? currentIndex.value + 1 
      : 0
  }
}

const playTrack = (index: number) => {
  if (index >= 0 && index < props.items.length) {
    currentIndex.value = index
  }
}

const toggleMute = () => {
  if (!audioElement.value) return
  
  if (isMuted.value) {
    // 取消静音
    isMuted.value = false
    audioElement.value.muted = false
    volume.value = lastVolume.value
    audioElement.value.volume = volume.value / 100
  } else {
    // 静音
    lastVolume.value = volume.value
    isMuted.value = true
    audioElement.value.muted = true
    volume.value = 0
  }
}

const togglePlayMode = () => {
  const modes: PlayMode[] = ['repeat', 'shuffle', 'repeatOne']
  const currentModeIndex = modes.indexOf(playMode.value)
  playMode.value = modes[(currentModeIndex + 1) % modes.length]
  
  const modeNames = {
    repeat: '列表循环',
    shuffle: '随机播放',
    repeatOne: '单曲循环'
  }
  MessageUtil.info(`播放模式: ${modeNames[playMode.value]}`)
}

const getPlayModeTitle = () => {
  const modeNames = {
    repeat: '列表循环',
    shuffle: '随机播放',
    repeatOne: '单曲循环'
  }
  return `${modeNames[playMode.value]} (R)`
}

const togglePlaylist = () => {
  showPlaylist.value = !showPlaylist.value
}

const closePlaylistOnOverlay = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    showPlaylist.value = false
  }
}

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '00:00'
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 键盘快捷键处理
const handleKeydown = (event: KeyboardEvent) => {
  // 防止在输入框中触发快捷键
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return
  }

  switch (event.code) {
    case 'Space':
      event.preventDefault()
      togglePlay()
      break
    case 'ArrowLeft':
      event.preventDefault()
      if (event.shiftKey) {
        // Shift + 左箭头：快退10秒
        if (audioElement.value) {
          audioElement.value.currentTime = Math.max(0, audioElement.value.currentTime - 10)
        }
      } else {
        previousTrack()
      }
      break
    case 'ArrowRight':
      event.preventDefault()
      if (event.shiftKey) {
        // Shift + 右箭头：快进10秒
        if (audioElement.value) {
          audioElement.value.currentTime = Math.min(duration.value, audioElement.value.currentTime + 10)
        }
      } else {
        nextTrack()
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      volume.value = Math.min(100, volume.value + 5)
      onVolumeChange(volume.value)
      break
    case 'ArrowDown':
      event.preventDefault()
      volume.value = Math.max(0, volume.value - 5)
      onVolumeChange(volume.value)
      break
    case 'KeyM':
      event.preventDefault()
      toggleMute()
      break
    case 'KeyR':
      event.preventDefault()
      togglePlayMode()
      break
    case 'KeyL':
      event.preventDefault()
      togglePlaylist()
      break
    case 'Escape':
      if (showPlaylist.value) {
        showPlaylist.value = false
      }
      break
  }
}

// 事件处理
const onLoadStart = () => {
  isLoading.value = true
}

const onCanPlay = () => {
  isLoading.value = false
  clearError()
}

const onLoadedMetadata = () => {
  if (audioElement.value) {
    duration.value = audioElement.value.duration
  }
}

const onTimeUpdate = () => {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime
  }
}

const onAudioEnded = () => {
  isPlaying.value = false
  
  if (playMode.value === 'repeatOne') {
    // 单曲循环
    if (audioElement.value) {
      audioElement.value.currentTime = 0
      audioElement.value.play()
    }
  } else if (playMode.value === 'repeat' || playMode.value === 'shuffle') {
    // 列表循环或随机播放
    nextTrack()
  }
}

const onAudioError = (error: Event) => {
  console.error('音频播放错误:', error)
  isPlaying.value = false
  isLoading.value = false
  showError('音频播放出错，请检查文件是否损坏')
}

const onProgressChange = (value: SliderValue) => {
  if (typeof value === 'number') {
    progressValue.value = value
  }
}

const onVolumeChange = (value: SliderValue) => {
  if (typeof value === 'number' && audioElement.value) {
    volume.value = value
    audioElement.value.volume = value / 100
    if (value > 0) {
      isMuted.value = false
      audioElement.value.muted = false
    }
  }
}

// 监听器
watch(currentIndex, () => {
  loadAudio()
})

watch(() => props.items, (newItems) => {
  if (newItems.length === 0) {
    currentIndex.value = 0
    return
  }
  
  if (currentIndex.value >= newItems.length) {
    currentIndex.value = 0
  }
}, { deep: true })

watch(() => audioElement.value, (newAudio) => {
  if (newAudio) {
    newAudio.addEventListener('play', () => { isPlaying.value = true })
    newAudio.addEventListener('pause', () => { isPlaying.value = false })
    newAudio.volume = volume.value / 100
  }
})

// 生命周期
onMounted(() => {
  loadAudio()
  // 聚焦到组件以接收键盘事件
  nextTick(() => {
    const element = document.querySelector('.audio-viewer') as HTMLElement
    if (element) {
      element.focus()
    }
  })
})

onUnmounted(() => {
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.src = ''
  }
})
</script>

<style scoped>
.audio-viewer {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #1f1f1f 0%, #2d2d2d 100%);
  color: #ffffff;
  padding: 20px;
  box-sizing: border-box;
  outline: none;
  position: relative;
  overflow: hidden;
}

/* 错误提示 */
.error-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(213, 73, 65, 0.1);
  border: 1px solid rgba(213, 73, 65, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  color: #ff6b6b;
}

.error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.retry-btn {
  margin-left: auto;
  color: #ff6b6b;
}

/* 顶部信息栏 */
.audio-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.audio-info {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 100%;
}

.status-icon {
  width: 20px;
  height: 20px;
  color: #0052d9;
  flex-shrink: 0;
}

.audio-title {
  font-size: 18px;
  font-weight: 500;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}

.play-mode-icon {
  margin-left: 12px;
}

.mode-icon {
  width: 16px;
  height: 16px;
  color: #0052d9;
}

/* 专辑封面区域 */
.album-cover-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 40px 0;
  position: relative;
}

.album-cover {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #333 0%, #444 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 
    0 8px 32px rgba(0, 82, 217, 0.2),
    inset 0 0 0 8px rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease;
  position: relative;
  overflow: hidden;
}

.album-cover.spinning {
  animation: spin 20s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.default-cover-icon {
  width: 80px;
  height: 80px;
  color: #666;
}

.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #0052d9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 播放控制区域 */
.playback-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
}

.control-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: transparent;
  color: #ffffff;
  transition: all 0.2s ease;
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.play-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #0052d9;
  color: #ffffff;
  transition: all 0.2s ease;
}

.play-btn:hover {
  background: #366ef4;
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 82, 217, 0.4);
}

/* 进度控制区域 */
.progress-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
}

.time-display {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #ccc;
  min-width: 45px;
  text-align: center;
}

.progress-slider {
  flex: 1;
}

/* 音量控制区域 */
.volume-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  justify-content: center;
}

.volume-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  color: #ffffff;
  transition: all 0.2s ease;
}

.volume-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.volume-slider {
  width: 120px;
}

.volume-text {
  font-size: 12px;
  color: #ccc;
  min-width: 35px;
  text-align: center;
}

/* 模式控制区域 */
.mode-controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px 0;
}

.mode-btn,
.playlist-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  color: #ffffff;
  transition: all 0.2s ease;
}

.mode-btn:hover,
.playlist-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

/* 播放列表 */
.playlist-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10px);
}

.playlist-content {
  background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.playlist-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.playlist-items {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.playlist-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.playlist-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.playlist-item.active {
  background: rgba(0, 82, 217, 0.2);
  color: #0052d9;
  border-left: 3px solid #0052d9;
}

.item-info {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
}

.item-index {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #666;
  min-width: 24px;
}

.item-name {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.playing-icon {
  width: 16px;
  height: 16px;
  color: #0052d9;
  flex-shrink: 0;
}

/* TDesign组件样式覆盖 */
:deep(.t-slider__track) {
  background: rgba(255, 255, 255, 0.2);
  height: 4px;
}

:deep(.t-slider__track-active) {
  background: #0052d9;
}

:deep(.t-slider__thumb) {
  background: #0052d9;
  border: 2px solid #ffffff;
  width: 16px;
  height: 16px;
}

:deep(.t-slider__thumb:hover) {
  box-shadow: 0 0 0 8px rgba(0, 82, 217, 0.2);
}

:deep(.t-button--variant-base) {
  background: #0052d9;
  border-color: #0052d9;
}

:deep(.t-button--variant-base:hover) {
  background: #366ef4;
  border-color: #366ef4;
}

:deep(.t-button--variant-text) {
  color: #ffffff;
}

:deep(.t-button--variant-text:hover) {
  background: rgba(255, 255, 255, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .audio-viewer {
    padding: 16px;
  }
  
  .album-cover {
    width: 160px;
    height: 160px;
  }
  
  .default-cover-icon {
    width: 60px;
    height: 60px;
  }
  
  .audio-title {
    font-size: 16px;
    max-width: 200px;
  }
  
  .playlist-content {
    width: 95%;
    max-height: 85vh;
  }
  
  .volume-slider {
    width: 80px;
  }
}

@media (max-width: 480px) {
  .playback-controls {
    gap: 16px;
  }
  
  .control-btn {
    width: 44px;
    height: 44px;
  }
  
  .play-btn {
    width: 56px;
    height: 56px;
  }
  
  .progress-section,
  .volume-section {
    gap: 12px;
  }
}
</style>