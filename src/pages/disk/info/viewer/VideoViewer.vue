<template>
  <div class="video-viewer">
    <!-- 错误提示 -->
    <div v-if="hasError" class="error-banner">
      <ErrorCircleIcon class="error-icon"/>
      <span>{{ errorMessage }}</span>
      <t-button variant="text" @click="retryLoad" class="retry-btn">重试</t-button>
    </div>

    <!-- 视频播放区域 -->
    <div class="video-container">
      <div ref="artPlayerRef" class="art-player-container"></div>

      <!-- 加载中状态 -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
    </div>

    <!-- 播放列表按钮 -->
    <div class="playlist-toggle">
      <t-button
        variant="text"
        @click="togglePlaylist"
        class="playlist-btn"
      >
        <template #icon>
          <ListIcon/>
        </template>
        <span>播放列表</span>
      </t-button>
    </div>

    <!-- 播放列表 -->
    <div :class="['playlist-container', { hidden: !showPlaylist }]" @click="closePlaylistOnOverlay">
      <div class="playlist-content" @click.stop>
        <div class="playlist-header">
          <h3>播放列表 ({{ items.length }}个)</h3>
          <t-button variant="text" shape="square" theme="danger" @click="togglePlaylist">
            <template #icon>
              <close-icon />
            </template>
          </t-button>
        </div>
        <div class="playlist-items">
          <div
            v-for="(item, index) in items"
            :key="index"
            :class="['playlist-item', { active: index === currentIndex }]"
            @click="playVideo(index)"
          >
            <div class="item-info">
              <span class="item-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="item-name">{{ item.name }}</span>
              <PlayIcon v-if="index === currentIndex && isPlaying" class="playing-icon"/>
              <PauseIcon v-else-if="index === currentIndex && !isPlaying" class="playing-icon"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {DirItem} from '@/apis/plugin/disk/list'
import MessageUtil from '@/utils/modal/MessageUtil'
import Artplayer from 'artplayer'
import {
  PlayIcon,
  PauseIcon,
  ListIcon,
  CloseIcon,
  ErrorCircleIcon
} from 'tdesign-icons-vue-next'
import {playFlv} from "@/plugin/ArtPlayerPlugin.ts";

// 类型定义
interface DirItemWrapper extends DirItem {
  url: string
}

// Props定义
interface Props {
  items: DirItemWrapper[]
  initialIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0
})

// 响应式数据
const artPlayerRef = ref<HTMLDivElement>()
const artPlayer = ref<Artplayer>()
const currentIndex = ref(props.initialIndex)
const isPlaying = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const hasError = ref(false)
const showPlaylist = ref(false)

// 计算属性
const currentVideo = computed(() => {
  return props.items[currentIndex.value] || null
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

const loadVideo = async () => {
  if (!artPlayer.value || !currentVideo.value) return

  try {
    isLoading.value = true
    clearError()

    // 确保URL是有效的
    if (!currentVideo.value.url) {
      return MessageUtil.error("无效的视频URL")
    }

    // 加载新视频
    await artPlayer.value.switchUrl(currentVideo.value.url)
    await artPlayer.value.play();

    // 延迟一段时间后再尝试播放，确保视频已加载
    if (isPlaying.value) {
      setTimeout(() => {
        if (artPlayer.value) {
          artPlayer.value.play().catch(err => {
            console.error('播放视频失败:', err)
          })
        }
      }, 300)
    }

  } catch (error) {
    console.error('加载视频失败:', error)
    showError('视频加载失败，请检查文件路径')
    isLoading.value = false
  }
}

const retryLoad = () => {
  clearError()
  loadVideo()
}

const nextVideo = () => {
  if (props.items.length <= 1) return

  currentIndex.value = currentIndex.value < props.items.length - 1
    ? currentIndex.value + 1
    : 0
}

const playVideo = (index: number) => {
  if (index >= 0 && index < props.items.length) {
    currentIndex.value = index;
    showPlaylist.value = false;
  }
}

const togglePlaylist = () => {
  showPlaylist.value = !showPlaylist.value
}

const closePlaylistOnOverlay = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    showPlaylist.value = false
  }
}

const initArtPlayer = () => {
  if (!artPlayerRef.value || !currentVideo.value) return

  // 销毁之前的实例
  if (artPlayer.value) {
    artPlayer.value.destroy()
    artPlayer.value = undefined
  }

  try {
    // 创建新的播放器实例
    artPlayer.value = new Artplayer({
      container: artPlayerRef.value as HTMLDivElement,
      url: currentVideo.value.url,
      volume: 0.8,
      isLive: false,
      muted: false,
      autoplay: false,
      pip: true,
      // autoSize: true,
      autoMini: true,
      screenshot: true,
      setting: true,
      loop: false,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      subtitleOffset: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: true,
      airplay: true,
      theme: '#0052d9',
      lang: navigator.language.toLowerCase(),
      moreVideoAttr: {
        crossOrigin: 'anonymous',
        preload: 'auto',
      },
      icons: {
        loading: '<div class="loading-spinner"></div>',
      },
      customType: {
        flv: playFlv
      },
    });
  } catch (error) {
    console.error('初始化播放器失败:', error);
    showError('初始化视频播放器失败');
    return;
  }

  // 事件监听
  artPlayer.value.on('ready', () => {
    isLoading.value = false
  })

  artPlayer.value.on('play', () => {
    isPlaying.value = true
  })

  artPlayer.value.on('pause', () => {
    isPlaying.value = false
  })

  artPlayer.value.on('video:ended', () => {
    isPlaying.value = false
    // 播放结束后自动播放下一个视频
    nextVideo()
  })

  artPlayer.value.on('error', (error) => {
    console.error('视频播放器错误:', error)
    isPlaying.value = false
    isLoading.value = false
    showError('视频播放出错，请检查文件是否损坏')
  })

  // 添加视频加载事件
  artPlayer.value.on('video:loadeddata', () => {
    isLoading.value = false
  })
}

// 监听器
watch(currentIndex, () => {
  loadVideo()
})

watch(() => props.items, (newItems) => {
  if (newItems.length === 0) {
    currentIndex.value = 0
    return
  }

  if (currentIndex.value >= newItems.length) {
    currentIndex.value = 0
  }

  // 如果播放器已初始化，重新加载视频
  if (artPlayer.value) {
    loadVideo()
  }
}, {deep: true})

// 生命周期
onMounted(() => {
  // 确保DOM已渲染
  nextTick(() => {
    initArtPlayer()
  })
})

onUnmounted(() => {
  // 销毁播放器实例
  if (artPlayer.value) {
    artPlayer.value.destroy()
    artPlayer.value = undefined
  }
})
</script>

<style lang="less" scoped>
.video-viewer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: var(--td-bg-color-page);
  color: var(--td-text-color-primary);
  overflow: hidden;

  // 错误提示
  .error-banner {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--td-error-color-light);
    border: 1px solid var(--td-error-color-3);
    border-radius: 8px;
    padding: 12px 16px;
    color: var(--td-error-color);
    box-shadow: var(--td-shadow-1);

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

  // 视频容器 - 占满全屏
  .video-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
    overflow: hidden;

    .art-player-container {
      width: 100%;
      height: 100%;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10;

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-top: 3px solid var(--td-brand-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }
  }

  // 播放列表按钮
  .playlist-toggle {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 20;

    .playlist-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(0, 0, 0, 0.5);
      color: var(--td-text-color-anti);
      border-radius: 20px;
      padding: 8px 16px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(0, 0, 0, 0.7);
        transform: translateX(-4px);
      }
    }
  }

  // 播放列表 - 修复隐藏后仍占用空间的问题
  .playlist-container {
    position: absolute;
    top: 0;
    right: 0;
    width: 30%;
    height: 100%;
    background: var(--td-bg-color-container);
    z-index: 1000002;
    box-shadow: var(--td-shadow-3);
    display: flex;
    flex-direction: column;
    transform: translateX(0);
    transition: transform 0.3s ease;

    &.hidden {
      transform: translateX(100%);
    }

    .playlist-content {
      display: flex;
      flex-direction: column;
      height: 100%;

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
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// TDesign组件样式覆盖
:deep(.t-button--variant-base) {
  background: var(--td-brand-color);
  border-color: var(--td-brand-color);
}

:deep(.t-button--variant-base:hover) {
  background: var(--td-brand-color-hover);
  border-color: var(--td-brand-color-hover);
}

:deep(.t-button--variant-text) {
  color: var(--td-text-color-anti);
}

:deep(.t-button--variant-text:hover) {
  background: rgba(0, 0, 0, 0.3);
}

// 响应式设计
@media (max-width: 768px) {
  .video-viewer {
    .playlist-container {
      width: 100%;
      height: 40%;
      top: auto;
      bottom: 0;

      &.hidden {
        transform: translateY(100%);
      }
    }
  }
}
</style>