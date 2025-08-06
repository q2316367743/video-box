<template>
  <div class="audio-viewer">
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
          <Radio1Icon v-if="playMode === 'shuffle'" class="mode-icon" />
          <ReplayIcon v-if="playMode === 'repeatOne'" class="mode-icon" />
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
      >
        <BackwardIcon />
      </t-button>
      
      <t-button 
        variant="base" 
        size="large" 
        @click="togglePlay"
        class="play-btn"
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
      >
        <ForwardIcon />
      </t-button>
    </div>

    <!-- 进度控制区域 -->
    <div class="progress-section">
      <span class="time-display">{{ formatTime(currentTime) }}</span>
      <t-progress
        :percentage="progressValue"
        :min="0"
        :max="100"
        class="progress-slider"
        :disabled="!currentAudio"
        :label="false"
      />
      <span class="time-display">{{ formatTime(duration) }}</span>
    </div>

    <!-- 音量控制区域 -->
    <div class="volume-section">
      <t-button variant="text" @click="toggleMute" class="volume-btn">
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
        <Radio1Icon v-if="playMode === 'shuffle'" />
        <ReplayIcon v-if="playMode === 'repeatOne'" />
      </t-button>
      <t-button 
        variant="text" 
        @click="togglePlaylist" 
        class="playlist-btn"
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
      @play="isPlaying = true"
      @pause="isPlaying = false"
      preload="auto"
      crossorigin="anonymous"
      style="display: none;"
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
  Radio1Icon,
  ReplayIcon,
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
const progressValue = ref(0)

// 计算属性
const currentAudio = computed(() => {
  return props.items[currentIndex.value] || null
})

// 监听时间更新，同步进度条
watch([currentTime, duration], ([time, dur]) => {
  if (dur > 0) {
    progressValue.value = (time / dur) * 100
  } else {
    progressValue.value = 0
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
    
    // 确保URL是有效的
    if (!currentAudio.value.url) {
      throw new Error('无效的音频URL')
    }
    
    audioElement.value.src = currentAudio.value.url
    audioElement.value.load()
    
    // 如果之前是播放状态，则自动播放
    if (isPlaying.value) {
      try {
        await audioElement.value.play()
      } catch (playError) {
        console.error('自动播放失败:', playError)
      }
    }
    
  } catch (error) {
    console.error('加载音频失败:', error)
    showError('音频加载失败，请检查文件路径')
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
      isPlaying.value = false
    } else {
      await audioElement.value.play()
      isPlaying.value = true
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
  return modeNames[playMode.value]
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
    
    // 确保音量设置正确
    audioElement.value.volume = volume.value / 100
  }
}

const onTimeUpdate = () => {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime
    
    // 确保进度条更新
    if (duration.value > 0) {
      progressValue.value = (currentTime.value / duration.value) * 100
    }
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
  if (typeof value === 'number' && audioElement.value && duration.value > 0) {
    // 只有当用户拖动进度条时才更新时间
    // 避免在timeupdate事件中的进度条更新反过来触发这个函数
    if (Math.abs(value - (currentTime.value / duration.value * 100)) > 1) {
      const newTime = (value / 100) * duration.value
      audioElement.value.currentTime = newTime
      currentTime.value = newTime // 直接更新当前时间，避免闪烁
    }
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
  // 切换音轨时重置时间和进度
  currentTime.value = 0
  progressValue.value = 0
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
    // 设置音量
    newAudio.volume = volume.value / 100
    
    // 移除可能存在的旧事件监听器，避免重复添加
    const oldAudio = audioElement.value
    if (oldAudio) {
      oldAudio.removeEventListener('play', () => { isPlaying.value = true })
      oldAudio.removeEventListener('pause', () => { isPlaying.value = false })
    }
    
    // 添加新的事件监听器
    newAudio.addEventListener('play', () => { isPlaying.value = true })
    newAudio.addEventListener('pause', () => { isPlaying.value = false })
  }
})

// 生命周期
onMounted(() => {
  // 确保音频元素已创建
  nextTick(() => {
    loadAudio()
    
    // 确保音量设置正确
    if (audioElement.value) {
      audioElement.value.volume = volume.value / 100
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

<style lang="less" scoped>
.audio-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--td-bg-color-page);
  color: var(--td-text-color-primary);
  padding: 20px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  // 错误提示
  .error-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--td-error-color-light);
    border: 1px solid var(--td-error-color-3);
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 20px;
    color: var(--td-error-color);

    .error-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .retry-btn {
      margin-left: auto;
      color: var(--td-error-color);
    }
  }

  // 顶部信息栏
  .audio-header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid var(--td-border-level-1-color);

    .audio-info {
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: 100%;

      .status-icon {
        width: 20px;
        height: 20px;
        color: var(--td-brand-color);
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

        .mode-icon {
          width: 16px;
          height: 16px;
          color: var(--td-brand-color);
        }
      }
    }
  }

  // 专辑封面区域
  .album-cover-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    padding: 40px 0;
    position: relative;

    .album-cover {
      width: 200px;
      height: 200px;
      background: var(--td-bg-color-component);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: var(--td-shadow-2);
      transition: transform 0.3s ease;
      position: relative;
      overflow: hidden;

      &.spinning {
        animation: spin 20s linear infinite;
      }

      .default-cover-icon {
        width: 80px;
        height: 80px;
        color: var(--td-text-color-placeholder);
      }
    }

    .loading-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--td-mask-active);
      border-radius: 50%;
      width: 200px;
      height: 200px;
      display: flex;
      justify-content: center;
      align-items: center;

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--td-text-color-placeholder);
        border-top: 3px solid var(--td-brand-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }
  }

  // 播放控制区域
  .playback-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    padding: 20px 0;

    .control-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: transparent;
      color: var(--td-text-color-primary);
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: var(--td-bg-color-container-hover);
        transform: scale(1.05);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .play-btn {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--td-brand-color);
      color: var(--td-text-color-anti);
      transition: all 0.2s ease;

      &:hover {
        background: var(--td-brand-color-hover);
        transform: scale(1.05);
        box-shadow: var(--td-shadow-2);
      }
    }
  }

  // 进度控制区域
  .progress-section {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 0;

    .time-display {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: var(--td-text-color-secondary);
      min-width: 45px;
      text-align: center;
    }

    .progress-slider {
      flex: 1;
    }
  }

  // 音量控制区域
  .volume-section {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 0;
    justify-content: center;

    .volume-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: transparent;
      color: var(--td-text-color-primary);
      transition: all 0.2s ease;

      &:hover {
        background: var(--td-bg-color-container-hover);
      }
    }

    .volume-slider {
      width: 120px;
    }

    .volume-text {
      font-size: 12px;
      color: var(--td-text-color-secondary);
      min-width: 35px;
      text-align: center;
    }
  }

  // 模式控制区域
  .mode-controls {
    display: flex;
    justify-content: center;
    gap: 20px;
    padding: 20px 0;

    .mode-btn,
    .playlist-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: transparent;
      color: var(--td-text-color-primary);
      transition: all 0.2s ease;

      &:hover {
        background: var(--td-bg-color-container-hover);
        transform: scale(1.05);
      }
    }
  }

  // 播放列表
  .playlist-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--td-mask-active);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(10px);

    .playlist-content {
      background: var(--td-bg-color-container);
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      box-shadow: var(--td-shadow-3);

      .playlist-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid var(--td-border-level-1-color);

        h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
        }
      }

      .playlist-items {
        flex: 1;
        overflow-y: auto;
        padding: 10px;

        .playlist-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 4px;

          &:hover {
            background: var(--td-bg-color-container-hover);
            transform: translateX(4px);
          }

          &.active {
            background: var(--td-brand-color-light);
            color: var(--td-brand-color);
            border-left: 3px solid var(--td-brand-color);
          }

          .item-info {
            display: flex;
            align-items: center;
            width: 100%;
            gap: 12px;

            .item-index {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              color: var(--td-text-color-placeholder);
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
              color: var(--td-brand-color);
              flex-shrink: 0;
            }
          }
        }
      }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// TDesign组件样式覆盖
:deep(.t-slider__track) {
  background: var(--td-bg-color-component);
  height: 4px;
}

:deep(.t-slider__track-active) {
  background: var(--td-brand-color);
}

:deep(.t-slider__thumb) {
  background: var(--td-brand-color);
  border: 2px solid var(--td-text-color-anti);
  width: 16px;
  height: 16px;
}

:deep(.t-slider__thumb:hover) {
  box-shadow: 0 0 0 8px var(--td-brand-color-focus);
}

:deep(.t-button--variant-base) {
  background: var(--td-brand-color);
  border-color: var(--td-brand-color);
}

:deep(.t-button--variant-base:hover) {
  background: var(--td-brand-color-hover);
  border-color: var(--td-brand-color-hover);
}

:deep(.t-button--variant-text) {
  color: var(--td-text-color-primary);
}

:deep(.t-button--variant-text:hover) {
  background: var(--td-bg-color-container-hover);
}

// 响应式设计
@media (max-width: 768px) {
  .audio-viewer {
    padding: 16px;

    .album-cover-container .album-cover {
      width: 160px;
      height: 160px;

      .default-cover-icon {
        width: 60px;
        height: 60px;
      }
    }

    .audio-header .audio-info .audio-title {
      font-size: 16px;
      max-width: 200px;
    }

    .playlist-container .playlist-content {
      width: 95%;
      max-height: 85vh;
    }

    .volume-section .volume-slider {
      width: 80px;
    }
  }
}

@media (max-width: 480px) {
  .audio-viewer {
    .playback-controls {
      gap: 16px;

      .control-btn {
        width: 44px;
        height: 44px;
      }

      .play-btn {
        width: 56px;
        height: 56px;
      }
    }

    .progress-section,
    .volume-section {
      gap: 12px;
    }
  }
}
</style>