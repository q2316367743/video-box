<template>
  <div class="image-viewer">
    <!-- 操作按钮栏 -->
    <div class="image-viewer__toolbar">
      <t-space>
        <t-tooltip content="放大">
          <t-button 
            variant="outline" 
            size="small" 
            @click="zoomIn"
            :disabled="scale >= maxScale"
          >
            <template #icon>
              <ZoomInIcon />
            </template>
          </t-button>
        </t-tooltip>
        
        <t-tooltip content="缩小">
          <t-button 
            variant="outline" 
            size="small" 
            @click="zoomOut"
            :disabled="scale <= minScale"
          >
            <template #icon>
              <ZoomOutIcon />
            </template>
          </t-button>
        </t-tooltip>
        
        <t-tooltip content="垂直镜像">
          <t-button 
            variant="outline" 
            size="small" 
            @click="flipVertical"
          >
            <template #icon>
              <FlipVerticalIcon />
            </template>
          </t-button>
        </t-tooltip>
        
        <t-tooltip content="水平镜像">
          <t-button 
            variant="outline" 
            size="small" 
            @click="flipHorizontal"
          >
            <template #icon>
              <FlipHorizontalIcon />
            </template>
          </t-button>
        </t-tooltip>
        
        <t-tooltip content="顺时针旋转">
          <t-button 
            variant="outline" 
            size="small" 
            @click="rotateClockwise"
          >
            <template #icon>
              <RotateRightIcon />
            </template>
          </t-button>
        </t-tooltip>
        
        <t-tooltip content="逆时针旋转">
          <t-button 
            variant="outline" 
            size="small" 
            @click="rotateCounterClockwise"
          >
            <template #icon>
              <RotateLeftIcon />
            </template>
          </t-button>
        </t-tooltip>
        
        <t-tooltip content="下载">
          <t-button 
            variant="outline" 
            size="small" 
            @click="downloadImage"
          >
            <template #icon>
              <DownloadIcon />
            </template>
          </t-button>
        </t-tooltip>
      </t-space>
    </div>

    <!-- 图片预览区域 -->
    <div 
      class="image-viewer__preview"
      ref="previewContainer"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @dblclick="handleDoubleClick"
    >
      <div 
        class="image-viewer__image-container"
        :style="imageContainerStyle"
      >
        <img
          :src="currentImageUrl"
          :alt="`图片 ${currentIndex + 1}`"
          class="image-viewer__image"
          :style="imageStyle"
          @load="handleImageLoad"
          @error="handleImageError"
          draggable="false"
        />
      </div>
    </div>

    <!-- 缩略图导航栏 -->
    <div class="image-viewer__thumbnails">
      <div class="image-viewer__thumbnails-container">
        <div
          v-for="(url, index) in imageUrls"
          :key="index"
          class="image-viewer__thumbnail"
          :class="{ 'image-viewer__thumbnail--active': index === currentIndex }"
          @click="switchToImage(index)"
        >
          <img
            :src="url"
            :alt="`缩略图 ${index + 1}`"
            class="image-viewer__thumbnail-image"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ZoomInIcon,
  ZoomOutIcon,
  RotationIcon,
  DownloadIcon
} from 'tdesign-icons-vue-next'

// 自定义图标组件
const RotateLeftIcon = () => h('svg', {
  width: '16',
  height: '16',
  viewBox: '0 0 24 24',
  fill: 'currentColor'
}, [
  h('path', {
    d: 'M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13h2.02c.17 1.39.72 2.73 1.62 3.89l-1.41-1.42c-.52-.75-.87-1.59-1.23-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z'
  })
])

const RotateRightIcon = () => h('svg', {
  width: '16',
  height: '16',
  viewBox: '0 0 24 24',
  fill: 'currentColor'
}, [
  h('path', {
    d: 'M15.55 5.55L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10l4.55-4.45zM19.93 11c-.17-1.39-.72-2.73-1.62-3.89l1.42 1.42c.54.75.88 1.6 1.02 2.47h-0.82zm-1.62 1.89c.9-1.16 1.45-2.5 1.62-3.89h2.02c-.14.87-.48 1.72-1.02 2.47l-1.42 1.42z'
  })
])

const FlipVerticalIcon = () => h('svg', {
  width: '16',
  height: '16',
  viewBox: '0 0 24 24',
  fill: 'currentColor'
}, [
  h('path', {
    d: 'M16 17.01V10h-2v7.01h-1L15 19l2-1.99h-1zM9 3L7 5h1v7.01h2V5h1L9 3zm4 0h2v2h-2V3zm0 18h2v2h-2v-2zM3 3h2v2H3V3zm0 18h2v2H3v-2zm0-9h2v2H3v-2zm0-4.5h2v2H3v-2zm0 9h2v2H3v-2zM19 3h2v2h-2V3zm0 18h2v2h-2v-2zm0-9h2v2h-2v-2zm0-4.5h2v2h-2v-2zm0 9h2v2h-2v-2z'
  })
])

const FlipHorizontalIcon = () => h('svg', {
  width: '16',
  height: '16',
  viewBox: '0 0 24 24',
  fill: 'currentColor'
}, [
  h('path', {
    d: 'M15 21h2v-2h-2v2zm4-12h2V7h-2v2zM3 5v14c0 1.1.9 2 2 2h4V3H5c-1.1 0-2 .9-2 2zm2 2h2v10H5V7zm8-4h2v2h-2V3zm0 18h2v2h-2v-2zM9 5h2v14H9V5zm8-2v2h2c1.1 0 2 .9 2 2v4h-2V7h-2V3h-2zm2 18v-2h-2v2h2zm0-8h2v2h-2v-2z'
  })
])

// Props定义
interface Props {
  imageUrls: string[]
  initialIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0
})

// 响应式数据
const currentIndex = ref(props.initialIndex)
const scale = ref(1)
const rotation = ref(0)
const flipX = ref(1)
const flipY = ref(1)
const translateX = ref(0)
const translateY = ref(0)

// 拖拽相关
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartTranslateX = ref(0)
const dragStartTranslateY = ref(0)

// 触摸拖拽相关
const isTouching = ref(false)
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchStartTranslateX = ref(0)
const touchStartTranslateY = ref(0)

// 双指缩放相关
const isZooming = ref(false)
const initialDistance = ref(0)
const initialScale = ref(1)

// 拖拽边界限制
const dragBounds = ref({
  minX: 0,
  maxX: 0,
  minY: 0,
  maxY: 0
})

// 图片加载状态
const imageLoaded = ref(false)
const imageError = ref(false)

// 容器引用
const previewContainer = ref<HTMLElement>()

// 缩放限制
const minScale = 0.1
const maxScale = 5
const scaleStep = 0.25

// 计算属性
const currentImageUrl = computed(() => {
  return props.imageUrls[currentIndex.value] || ''
})

const imageStyle = computed(() => {
  return {
    transform: `scale(${scale.value}) rotate(${rotation.value}deg) scaleX(${flipX.value}) scaleY(${flipY.value})`,
    transition: isDragging.value ? 'none' : 'transform 0.3s ease',
  }
})

const imageContainerStyle = computed(() => {
  return {
    transform: `translate(${translateX.value}px, ${translateY.value}px)`,
    transition: isDragging.value ? 'none' : 'transform 0.3s ease',
  }
})

// 方法
const zoomIn = () => {
  if (scale.value < maxScale) {
    scale.value = Math.min(scale.value + scaleStep, maxScale)
  }
}

const zoomOut = () => {
  if (scale.value > minScale) {
    scale.value = Math.max(scale.value - scaleStep, minScale)
    // 如果缩小后图片完全可见，重置位置
    if (scale.value <= 1) {
      translateX.value = 0
      translateY.value = 0
    }
  }
}

const rotateClockwise = () => {
  rotation.value += 90
}

const rotateCounterClockwise = () => {
  rotation.value -= 90
}

const flipVertical = () => {
  flipY.value *= -1
}

const flipHorizontal = () => {
  flipX.value *= -1
}

const resetTransform = () => {
  scale.value = 1
  rotation.value = 0
  flipX.value = 1
  flipY.value = 1
  translateX.value = 0
  translateY.value = 0
}

const switchToImage = (index: number) => {
  if (index >= 0 && index < props.imageUrls.length) {
    currentIndex.value = index
    resetTransform()
  }
}

const downloadImage = async () => {
  try {
    const response = await fetch(currentImageUrl.value)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `image-${currentIndex.value + 1}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下载图片失败:', error)
  }
}

// 鼠标滚轮事件
const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  if (event.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

// 计算拖拽边界
const calculateDragBounds = () => {
  if (!previewContainer.value) return
  
  const containerRect = previewContainer.value.getBoundingClientRect()
  const imageWidth = containerRect.width * scale.value
  const imageHeight = containerRect.height * scale.value
  
  dragBounds.value = {
    minX: Math.min(0, (containerRect.width - imageWidth) / 2),
    maxX: Math.max(0, (imageWidth - containerRect.width) / 2),
    minY: Math.min(0, (containerRect.height - imageHeight) / 2),
    maxY: Math.max(0, (imageHeight - containerRect.height) / 2)
  }
}

// 限制拖拽范围
const constrainTranslation = (x: number, y: number) => {
  return {
    x: Math.max(dragBounds.value.minX, Math.min(dragBounds.value.maxX, x)),
    y: Math.max(dragBounds.value.minY, Math.min(dragBounds.value.maxY, y))
  }
}

// 鼠标拖拽事件
const handleMouseDown = (event: MouseEvent) => {
  event.preventDefault()
  calculateDragBounds()
  
  isDragging.value = true
  dragStartX.value = event.clientX
  dragStartY.value = event.clientY
  dragStartTranslateX.value = translateX.value
  dragStartTranslateY.value = translateY.value
  
  if (previewContainer.value) {
    previewContainer.value.style.cursor = 'grabbing'
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value) {
    const deltaX = event.clientX - dragStartX.value
    const deltaY = event.clientY - dragStartY.value
    
    const newX = dragStartTranslateX.value + deltaX
    const newY = dragStartTranslateY.value + deltaY
    
    if (scale.value > 1) {
      const constrained = constrainTranslation(newX, newY)
      translateX.value = constrained.x
      translateY.value = constrained.y
    } else {
      translateX.value = newX
      translateY.value = newY
    }
  }
}

const handleMouseUp = () => {
  isDragging.value = false
  if (previewContainer.value) {
    previewContainer.value.style.cursor = 'grab'
  }
}

// 触摸事件处理
const handleTouchStart = (event: TouchEvent) => {
  event.preventDefault()
  
  if (event.touches.length === 1) {
    // 单指拖拽
    calculateDragBounds()
    isTouching.value = true
    touchStartX.value = event.touches[0].clientX
    touchStartY.value = event.touches[0].clientY
    touchStartTranslateX.value = translateX.value
    touchStartTranslateY.value = translateY.value
  } else if (event.touches.length === 2) {
    // 双指缩放
    isZooming.value = true
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    initialDistance.value = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
    initialScale.value = scale.value
  }
}

const handleTouchMove = (event: TouchEvent) => {
  event.preventDefault()
  
  if (event.touches.length === 1 && isTouching.value && !isZooming.value) {
    // 单指拖拽
    const deltaX = event.touches[0].clientX - touchStartX.value
    const deltaY = event.touches[0].clientY - touchStartY.value
    
    const newX = touchStartTranslateX.value + deltaX
    const newY = touchStartTranslateY.value + deltaY
    
    if (scale.value > 1) {
      const constrained = constrainTranslation(newX, newY)
      translateX.value = constrained.x
      translateY.value = constrained.y
    } else {
      translateX.value = newX
      translateY.value = newY
    }
  } else if (event.touches.length === 2 && isZooming.value) {
    // 双指缩放
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    const currentDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
    
    const scaleRatio = currentDistance / initialDistance.value
    const newScale = Math.max(minScale, Math.min(maxScale, initialScale.value * scaleRatio))
    scale.value = newScale
    
    if (newScale <= 1) {
      translateX.value = 0
      translateY.value = 0
    }
  }
}

const handleTouchEnd = (event: TouchEvent) => {
  if (event.touches.length === 0) {
    isTouching.value = false
    isZooming.value = false
  }
}

// 双击重置
const handleDoubleClick = () => {
  if (scale.value > 1) {
    resetTransform()
  } else {
    scale.value = 2
    calculateDragBounds()
  }
}

// 图片加载事件
const handleImageLoad = () => {
  imageLoaded.value = true
  imageError.value = false
}

const handleImageError = () => {
  imageLoaded.value = false
  imageError.value = true
}

// 监听当前索引变化
watch(() => props.initialIndex, (newIndex) => {
  if (newIndex >= 0 && newIndex < props.imageUrls.length) {
    currentIndex.value = newIndex
    resetTransform()
  }
})

// 监听缩放变化，重新计算边界
watch(scale, () => {
  if (scale.value > 1) {
    calculateDragBounds()
  } else {
    translateX.value = 0
    translateY.value = 0
  }
})

// 监听图片URL变化
watch(currentImageUrl, () => {
  imageLoaded.value = false
  imageError.value = false
})

// 键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowLeft':
      if (currentIndex.value > 0) {
        switchToImage(currentIndex.value - 1)
      }
      break
    case 'ArrowRight':
      if (currentIndex.value < props.imageUrls.length - 1) {
        switchToImage(currentIndex.value + 1)
      }
      break
    case '+':
    case '=':
      zoomIn()
      break
    case '-':
      zoomOut()
      break
    case 'r':
      rotateClockwise()
      break
    case 'R':
      rotateCounterClockwise()
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.image-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--td-bg-color-container);
  border-radius: 8px;
  overflow: hidden;
}

.image-viewer__toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  background: var(--td-bg-color-container);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 8px;
  box-shadow: var(--td-shadow-2);
}

.image-viewer__preview {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: 
    linear-gradient(45deg, var(--td-bg-color-component) 25%, transparent 25%), 
    linear-gradient(-45deg, var(--td-bg-color-component) 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, var(--td-bg-color-component) 75%), 
    linear-gradient(-45deg, transparent 75%, var(--td-bg-color-component) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.image-viewer__preview:active {
  cursor: grabbing;
}

.image-viewer__preview.dragging {
  cursor: grabbing;
}

.image-viewer__image-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-viewer__image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}

.image-viewer__thumbnails {
  height: 80px;
  background: var(--td-bg-color-component);
  border-top: 1px solid var(--td-border-level-2-color);
  padding: 8px;
  overflow-x: auto;
}

.image-viewer__thumbnails-container {
  display: flex;
  gap: 8px;
  height: 100%;
}

.image-viewer__thumbnail {
  flex-shrink: 0;
  height: 80px;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.image-viewer__thumbnail:hover {
  border-color: var(--td-brand-color);
  transform: scale(1.05);
}

.image-viewer__thumbnail--active {
  border-color:  var(--td-brand-color);
  box-shadow: var(--td-shadow-1)
}

.image-viewer__thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 滚动条样式 */
.image-viewer__thumbnails::-webkit-scrollbar {
  height: 4px;
}

.image-viewer__thumbnails::-webkit-scrollbar-track {
  background: var(--td-scroll-track-color);
  border-radius: 2px;
}

.image-viewer__thumbnails::-webkit-scrollbar-thumb {
  background: var(--td-scrollbar-color);
  border-radius: 2px;
}

.image-viewer__thumbnails::-webkit-scrollbar-thumb:hover {
  background: var(--td-scrollbar-hover-color);
}
</style>