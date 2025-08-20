<template>
  <div class="random-page">
    <!-- 顶部源选择器 -->
    <SourceSelector 
      :source-list="sourceList"
      :selected-source-id="selectedSourceId"
      :selected-tag="selectedTag"
      @select="selectSourceAndTag"
    />

    <!-- 堆叠卡片容器 -->
    <div class="cards-container" ref="containerRef">
      <MediaCard
        v-for="(item, index) in visibleCards" 
        :key="`card-${currentIndex + index}`"
        :item="item"
        :index="index"
        :is-top-card="index === 0"
        :show-swipe-hint="showSwipeHint"
        :drag-state="dragState"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @media-load="handleMediaLoad"
        @media-error="handleMediaError"
      />

      <!-- 空状态 -->
      <EmptyState 
        v-if="visibleCards.length === 0 && !loading"
        @refresh="refreshContent"
      />
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar">
      <t-button 
        theme="primary" 
        variant="outline" 
        shape="circle"
        size="large"
        @click="refreshContent"
      >
        <t-icon name="refresh" size="24px" />
      </t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { pluginRandomList, pluginRandomGet } from '@/apis/plugin/random'
import type { SourceRandom, SourceRandomRecordType } from '@/types/SourceRandom'

// 组件导入
import SourceSelector from './components/SourceSelector.vue'
import MediaCard from './components/MediaCard.vue'
import EmptyState from './components/EmptyState.vue'

// Hook导入
import { useDragHandler } from './hooks/useDragHandler'

// 响应式数据
const sourceList = ref<SourceRandom[]>([])
const selectedSourceId = ref<string>('all')
const selectedTag = ref<string>('')
const currentIndex = ref(0)
const containerRef = ref<HTMLElement>()
const showSwipeHint = ref(true)
const mediaQueue = ref<SourceRandomRecordType[]>([])
const loading = ref(false)

// 显示的卡片（最多3张）
const visibleCards = computed(() => {
  return mediaQueue.value.slice(currentIndex.value, currentIndex.value + 3)
})

// 卡片切换逻辑
const removeTopCard = () => {
  const topCard = document.querySelector('.top-card') as HTMLElement
  if (!topCard) return

  // 添加移除动画
  topCard.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out'
  topCard.style.transform = 'translateX(-100%) rotate(-30deg)'
  topCard.style.opacity = '0'

  // 动画完成后移除卡片
  setTimeout(() => {
    currentIndex.value++
    preloadNextBatch()
    
    // 隐藏滑动提示
    if (showSwipeHint.value) {
      showSwipeHint.value = false
    }
  }, 300)
}

const swipeLeft = () => {
  if (visibleCards.value.length > 0) {
    removeTopCard()
  }
}

// 使用拖拽Hook
const {
  dragState,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp
} = useDragHandler(swipeLeft)

// 数据加载逻辑
const loadSourceList = async () => {
  try {
    const response = await pluginRandomList()
    sourceList.value = response.filter(source => source.is_enabled) || []
  } catch (error) {
    console.error('加载随机源列表失败:', error)
    MessagePlugin.error('加载随机源列表失败')
  }
}

const loadRandomData = async (sourceId: string = selectedSourceId.value, tag: string = selectedTag.value, append: boolean = false) => {
  if (loading.value) return
  
  try {
    loading.value = true
    
    let finalSourceId = sourceId
    let finalTag = tag
    
    if (sourceId === 'all') {
      // 全部：随机选择一个启用的源
      const enabledSources = sourceList.value.filter(s => s.is_enabled)
      if (enabledSources.length === 0) {
        MessagePlugin.warning('没有可用的随机源')
        return
      }
      const randomSource = enabledSources[Math.floor(Math.random() * enabledSources.length)]
      finalSourceId = randomSource.id
      
      // 如果随机选中的源有标签，则随机选择一个标签
      if (randomSource.tags && randomSource.tags.length > 0) {
        const validTags = randomSource.tags.filter(t => t.trim())
        if (validTags.length > 0) {
          finalTag = validTags[Math.floor(Math.random() * validTags.length)]
        }
      }
    } else {
      // 指定了源
      const selectedSource = sourceList.value.find(s => s.id === sourceId)
      if (selectedSource && !tag) {
        // 没有指定标签，如果源有标签则随机选择一个
        if (selectedSource.tags && selectedSource.tags.length > 0) {
          const validTags = selectedSource.tags.filter(t => t.trim())
          if (validTags.length > 0) {
            finalTag = validTags[Math.floor(Math.random() * validTags.length)]
          }
        }
      }
      // 如果指定了标签，则直接使用指定的标签
    }
    
    const response = await pluginRandomGet(finalSourceId, finalTag || undefined)
    const newItems = response || []
    
    if (newItems.length === 0) {
      MessagePlugin.warning('没有获取到媒体内容')
      return
    }
    
    if (append) {
      mediaQueue.value.push(...newItems)
    } else {
      mediaQueue.value = newItems
      currentIndex.value = 0
    }
    
    // 预加载下一批数据
    preloadNextBatch()
    
  } catch (error) {
    console.error('加载随机数据失败:', error)
    MessagePlugin.error('加载随机数据失败')
  } finally {
    loading.value = false
  }
}

const preloadNextBatch = async () => {
  // 当剩余项目少于5个时，预加载下一批
  if (mediaQueue.value.length - currentIndex.value < 5) {
    await loadRandomData(selectedSourceId.value, selectedTag.value, true)
  }
}

// 源和标签选择
const selectSourceAndTag = async (sourceId: string, tag?: string) => {
  selectedSourceId.value = sourceId
  selectedTag.value = tag || ''
  await loadRandomData(sourceId, tag || '', false)
}

// 媒体加载处理
const handleMediaLoad = () => {
  // 媒体加载完成
}

const handleMediaError = () => {
  MessagePlugin.error('媒体加载失败')
}

// 刷新内容
const refreshContent = () => {
  loadRandomData(selectedSourceId.value, selectedTag.value, false)
}

// 生命周期
onMounted(async () => {
  await loadSourceList()
  if (sourceList.value.length > 0) {
    await loadRandomData('all')
  }
})
</script>

<style scoped lang="less">
.random-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--td-bg-color-page);
  overflow: hidden;
}

.cards-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.action-bar {
  padding: 20px;
  background: var(--td-bg-color-container);
  border-top: 1px solid var(--td-border-level-1-color);
  display: flex;
  justify-content: center;
  
  :deep(.t-button) {
    width: 56px;
    height: 56px;
    
    &:hover {
      transform: scale(1.1);
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .cards-container {
    padding: 20px 10px;
  }
  
  .action-bar {
    padding: 16px;
    
    :deep(.t-button) {
      width: 48px;
      height: 48px;
    }
  }
}
</style>