<template>
  <div class="source-selector">
    <!-- 源选择 -->
    <div class="source-row">
      <t-space>
        <t-button 
          :theme="selectedSourceId === 'all' ? 'primary' : 'default'"
          :variant="selectedSourceId === 'all' ? 'base' : 'outline'"
          @click="handleSourceSelect('all')"
        >
          全部
        </t-button>
        <t-button 
          v-for="source in sourceList" 
          :key="source.id"
          :theme="selectedSourceId === source.id ? 'primary' : 'default'"
          :variant="selectedSourceId === source.id ? 'base' : 'outline'"
          @click="handleSourceSelect(source.id)"
        >
          {{ source.name }}
        </t-button>
      </t-space>
    </div>

    <!-- 标签选择 -->
    <div class="tag-row" v-if="currentSourceTags.length > 0">
      <t-space>
        <t-button 
          size="small"
          :theme="selectedTag === '' ? 'primary' : 'default'"
          :variant="selectedTag === '' ? 'base' : 'outline'"
          @click="handleTagSelect('')"
        >
          全部标签
        </t-button>
        <t-button 
          v-for="tag in currentSourceTags" 
          :key="tag"
          size="small"
          :theme="selectedTag === tag ? 'primary' : 'default'"
          :variant="selectedTag === tag ? 'base' : 'outline'"
          @click="handleTagSelect(tag)"
        >
          {{ tag }}
        </t-button>
      </t-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SourceRandom } from '@/types/SourceRandom'

interface Props {
  sourceList: SourceRandom[]
  selectedSourceId: string
  selectedTag?: string
}

interface Emits {
  (e: 'select', sourceId: string, tag?: string): void
}

const props = withDefaults(defineProps<Props>(), {
  selectedTag: ''
})

const emit = defineEmits<Emits>()

// 当前选中源的标签列表
const currentSourceTags = computed(() => {
  if (props.selectedSourceId === 'all') {
    // 如果选择全部，则显示所有源的所有标签（去重）
    return [];
  } else {
    // 显示当前选中源的标签
    const currentSource = props.sourceList.find(source => source.id === props.selectedSourceId)
    return currentSource?.tags?.filter(tag => tag.trim()).sort() || []
  }
})

const handleSourceSelect = (sourceId: string) => {
  // 切换源时重置标签选择
  emit('select', sourceId, '')
}

const handleTagSelect = (tag: string) => {
  emit('select', props.selectedSourceId, tag)
}
</script>

<style scoped lang="less">
.source-selector {
  background: var(--td-bg-color-container);
  border-bottom: 1px solid var(--td-border-level-1-color);
  
  .source-row {
    padding: 16px 16px 8px 16px;
    overflow-x: auto;
    
    :deep(.t-space) {
      white-space: nowrap;
    }
  }
  
  .tag-row {
    padding: 0 16px 16px 16px;
    overflow-x: auto;
    border-top: 1px solid var(--td-border-level-2-color);
    margin-top: 8px;
    padding-top: 12px;
    
    :deep(.t-space) {
      white-space: nowrap;
    }
  }
}
</style>