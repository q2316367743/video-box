<template>
  <div class="folder-grid-view" v-if="current.type === 'folder'"
       @contextmenu="handleDirContextmenu({ sourceId: sourceId, item: current, e: $event, onRefresh })"
       @dragover.prevent
       @drop="handleDrop">
    <div v-if="loading" class="loading-container">
      <t-loading size="medium"/>
    </div>
    <div v-else-if="items.length === 0" class="empty-container">
      <t-empty description="暂无文件"/>
    </div>
    <div v-else class="grid-container">
      <div v-for="item in data" :key="item.path" class="grid-item"
           :class="{ 'drag-over': dragOverItem === item.path, 'dragging': draggingItem === item.path }"
           :title="item.name"
           :draggable="true" @click="handleClick(item)"
           @contextmenu.stop="handleDirItemContextmenu(sourceId, item, $event, () => onRefresh(true))"
           @dragstart="handleDragStart(item, $event)" @dragend="handleDragEnd"
           @dragover.prevent="handleDragOver(item, $event)" @dragleave="handleDragLeave(item, $event)"
           @drop.prevent="handleItemDrop(item, $event)">
        <FileIconView :item="item" class="file-icon" :type="item.type" :extname="item.extname"/>
        <div class="file-name" :title="item.name">{{ item.name }}</div>
      </div>
    </div>
  </div>
  <file-view v-else :current="current" :source-id="sourceId"/>
</template>
<script lang="ts" setup>
import {DirItem, pluginDiskList} from "@/apis/plugin/disk/list.ts";
import {DiskInfoInstance, diskInfoKey, sortFunc} from "@/pages/disk/info/constants.ts";
import {handleDirItemContextmenu} from '@/pages/disk/info/dialog/DirItemContextmenu';
import {handleDirContextmenu} from '@/pages/disk/info/dialog/DirContextmenu';
import FileIconView from "@/pages/disk/info/components/FileIconView.vue";
import FileView from '@/pages/disk/info/components/FileView.vue';
import {pluginDiskMove} from "@/apis/plugin/disk/link.ts";

const props = defineProps({
  current: {
    type: Object as PropType<DirItem>,
    required: true
  },
  sourceId: {
    type: String,
    default: ''
  }
});

const diskInfo = inject<DiskInfoInstance>(diskInfoKey);

const items = ref<Array<DirItem>>([]);
const loading = ref(false);

// 拖拽相关状态
const draggingItem = ref<string>('');
const dragOverItem = ref<string>('');
const draggedData = ref<DirItem>();
const data = computed(() => items.value.sort((a, b) => sortFunc(a, b, diskInfo?.sortType.value || 'name', diskInfo?.orderType.value || 'asc')));

const onRefresh = async (refresh: boolean) => {
  if (loading.value) return;
  loading.value = true;
  try {
    if (props.current?.type === 'folder') {
      items.value = [];
      items.value = await pluginDiskList(props.sourceId, {path: props.current.path, refresh})
    }
  } finally {
    loading.value = false
  }
};

const handleClick = async (item: DirItem) => {
  diskInfo?.setPath(item);
}

// 拖拽开始
const handleDragStart = (item: DirItem, event: DragEvent) => {
  draggingItem.value = item.path;
  draggedData.value = item;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', JSON.stringify(item));
  }
};

// 拖拽结束
const handleDragEnd = () => {
  draggingItem.value = '';
  dragOverItem.value = '';
  draggedData.value = undefined;
};

// 拖拽悬停在项目上
const handleDragOver = (item: DirItem, event: DragEvent) => {
  if (item.type === 'folder' && item.path !== draggingItem.value) {
    dragOverItem.value = item.path;
    event.dataTransfer!.dropEffect = 'move';
  }
};

// 拖拽离开项目
const handleDragLeave = (item: DirItem, event: DragEvent) => {
  // 检查是否真的离开了元素（而不是进入子元素）
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX;
  const y = event.clientY;

  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    if (dragOverItem.value === item.path) {
      dragOverItem.value = '';
    }
  }
};

// 放置到项目上
const handleItemDrop = (targetItem: DirItem, event: DragEvent) => {
  event.stopPropagation();

  if (targetItem.type === 'folder' && draggedData.value && targetItem.path !== draggedData.value.path) {
    // 触发拖拽移动事件
    pluginDiskMove(props.sourceId, draggedData.value.path, targetItem.path)
      .then(() => {
        onRefresh(true);
      });
  }

  handleDragEnd();
};

// 放置到容器上
const handleDrop = () => {
  // 如果放置到空白区域，可以在这里处理
  handleDragEnd();
};

watch(() => props.current, () => onRefresh(false), {immediate: true})
</script>
<style scoped lang="less">
.folder-grid-view {
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  overflow-y: auto;
}

.loading-container,
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  grid-gap: 16px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;

  &:hover {
    background-color: var(--td-bg-color-container-hover);
  }

  // 拖拽中的项目样式
  &.dragging {
    opacity: 0.5;
    // transform: scale(0.95);
  }

  // 拖拽悬停目标样式（文件夹放大效果）
  &.drag-over {
    // transform: scale(1.05);
    background-color: var(--td-brand-color-light);
    border: 2px dashed var(--td-brand-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    .file-icon {
      transform: scale(1.05);
    }
  }

  .file-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 8px;
    transition: transform 0.2s ease;
  }

  .file-name {
    width: 100%;
    text-align: center;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
