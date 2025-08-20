<template>
  <div 
    class="media-card"
    :class="cardClass"
    :style="cardStyle"
    @touchstart="isTopCard ? $emit('touchstart', $event) : null"
    @touchmove="isTopCard ? $emit('touchmove', $event) : null"
    @touchend="isTopCard ? $emit('touchend', $event) : null"
    @mousedown="isTopCard ? $emit('mousedown', $event) : null"
    @mousemove="isTopCard ? $emit('mousemove', $event) : null"
    @mouseup="isTopCard ? $emit('mouseup', $event) : null"
    @mouseleave="isTopCard ? $emit('mouseleave', $event) : null"
  >
    <div class="card-content" v-if="item">
      <!-- 图片内容 -->
      <img 
        v-if="isImage(item)"
        :src="getMediaUrl(item)"
        :alt="getMediaTitle(item)"
        class="media-image"
        @load="$emit('mediaLoad')"
        @error="$emit('mediaError')"
      />
      
      <!-- 视频内容 -->
      <video 
        v-else-if="isVideo(item)"
        :src="getMediaUrl(item)"
        class="media-video"
        controls
        autoplay
        loop
        preload="metadata"
        @loadeddata="$emit('mediaLoad')"
        @error="$emit('mediaError')"
      />
      
      <!-- 其他内容 -->
      <div v-else class="media-other">
        <t-icon name="file" size="48px" />
        <p>{{ getMediaTitle(item) || '未知内容' }}</p>
      </div>

      <!-- 媒体信息覆盖层 -->
      <div class="media-overlay" v-if="getMediaTitle(item) || getMediaDesc(item)">
        <div class="media-info">
          <h3 v-if="getMediaTitle(item)">{{ getMediaTitle(item) }}</h3>
          <p v-if="getMediaDesc(item)">{{ getMediaDesc(item) }}</p>
        </div>
      </div>

      <!-- 滑动提示 -->
      <div class="swipe-hint" v-if="isTopCard && showSwipeHint">
        <div class="hint-arrow">
          <t-icon name="swipe-left" />
          <span>左滑切换</span>
        </div>
      </div>
    </div>

    <!-- 加载占位 -->
    <div v-else class="card-loading">
      <t-loading size="large" />
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SourceRandomRecordType } from '@/types/SourceRandom'

interface Props {
  item: SourceRandomRecordType | null
  index: number
  isTopCard: boolean
  showSwipeHint: boolean
  dragState?: {
    isDragging: boolean
    deltaX: number
    deltaY: number
  }
}

interface Emits {
  (e: 'touchstart', event: TouchEvent): void
  (e: 'touchmove', event: TouchEvent): void
  (e: 'touchend', event: TouchEvent): void
  (e: 'mousedown', event: MouseEvent): void
  (e: 'mousemove', event: MouseEvent): void
  (e: 'mouseup', event: MouseEvent): void
  (e: 'mouseleave', event: MouseEvent): void
  (e: 'mediaLoad'): void
  (e: 'mediaError'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

// 卡片样式类
const cardClass = computed(() => ({
  'top-card': props.index === 0,
  'second-card': props.index === 1,
  'third-card': props.index === 2
}))

// 获取卡片样式
const cardStyle = computed(() => {
  const baseStyle = {
    zIndex: 3 - props.index,
    transform: `scale(${1 - props.index * 0.05}) translateY(${props.index * 8}px)`,
    opacity: 1 - props.index * 0.1
  }

  // 如果是顶部卡片且正在拖拽
  if (props.index === 0 && props.dragState?.isDragging) {
    const rotation = props.dragState.deltaX * 0.1
    const opacity = Math.max(0.5, 1 - Math.abs(props.dragState.deltaX) / 300)
    
    return {
      ...baseStyle,
      transform: `translate(${props.dragState.deltaX}px, ${props.dragState.deltaY}px) rotate(${rotation}deg) scale(1)`,
      opacity
    }
  }

  return baseStyle
})

// 工具函数
const isImage = (item: SourceRandomRecordType): boolean => {
  const url = getMediaUrl(item)
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url)
}

const isVideo = (item: SourceRandomRecordType): boolean => {
  const url = getMediaUrl(item)
  return /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i.test(url)
}

const getMediaUrl = (item: SourceRandomRecordType): string => {
  if (typeof item === 'string') {
    return item
  }
  return item.url || ''
}

const getMediaTitle = (item: SourceRandomRecordType): string => {
  if (typeof item === 'string') {
    return ''
  }
  return item.title || ''
}

const getMediaDesc = (item: SourceRandomRecordType): string => {
  if (typeof item === 'string') {
    return ''
  }
  return item.desc || ''
}
</script>

<style scoped lang="less">
.media-card {
  position: absolute;
  width: 380px;
  height: 600px;
  cursor: grab;
  transition: transform 0.3s ease, opacity 0.3s ease;
  
  &:active {
    cursor: grabbing;
  }
  
  &.top-card {
    z-index: 3;
  }
  
  &.second-card {
    z-index: 2;
    pointer-events: none;
  }
  
  &.third-card {
    z-index: 1;
    pointer-events: none;
  }
}

.card-content {
  width: 100%;
  height: 100%;
  background: var(--td-bg-color-container);
  border-radius: 20px;
  box-shadow: var(--td-shadow-3);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.media-image,
.media-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
}

.media-other {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--td-text-color-secondary);
  padding: 20px;
  text-align: center;
  
  p {
    margin-top: 16px;
    font-size: 16px;
    line-height: 1.4;
  }
}

.media-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 30px 20px 20px;
  border-radius: 0 0 20px 20px;
}

.media-info {
  color: white;
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.3;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
    line-height: 1.4;
  }
}

.swipe-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  opacity: 0.8;
  
  .hint-arrow {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--td-text-color-primary);
    background: var(--td-bg-color-container);
    padding: 16px;
    border-radius: 12px;
    box-shadow: var(--td-shadow-2);
    border: 1px solid var(--td-border-level-1-color);
    
    span {
      margin-top: 8px;
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.card-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--td-text-color-secondary);
  
  p {
    margin-top: 16px;
    font-size: 16px;
  }
}

// 移动端适配
@media (max-width: 768px) {
  .media-card {
    width: 320px;
    height: 520px;
  }
}

// 禁用文本选择和拖拽
.media-card {
  user-select: none;
  -webkit-user-drag: none;
}

.media-image,
.media-video {
  user-select: none;
  -webkit-user-drag: none;
}
</style>