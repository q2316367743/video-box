<template>
  <div class="folder-tree-view">
    <div class="folder-content" :class="{over}" :data-path="current.path" @dragover="handleDragOver($event)"
         @dragleave="handleDragLeave" @drop="handleDrop"
         @contextmenu.stop="handleDirContextmenu({sourceId, item:current, e:$event, onRefresh})">
      <t-loading :loading content="正在加载中">
        <div v-for="item in items" :key="item.path" class="dir-item flex gap-8px items-center"
             :class="{active: item.path === child?.path, choose: diskInfo?.current?.value?.path === item.path}"
             draggable="true" :data-path="item.path" :title="item.name"
             @click="handleClick(item)"
             @contextmenu.stop="handleDirItemContextmenu(sourceId, item, $event, () => onRefresh(true))"
             @dragstart="handleDrag(item)"
        >
          <file-icon-view :type="item.type" :extname="item.extname"/>
          <div class="ellipsis">{{ item.name }}</div>
        </div>
        <empty-result v-if="items.length === 0" title="空空如也" tip="当前目录没有数据，可以尝试刷新强制清除缓存"/>
      </t-loading>
    </div>
    <div class="file-items-content">
      <folder-tree-view v-if="child && child.type === 'folder'" :current="child" :source-id="sourceId"/>
      <file-view v-else-if="child && child.type === 'file'" :source-id="sourceId" :current="child"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {DirItem, pluginDiskList} from "@/apis/plugin/disk/list.ts";
import {
  DiskInfoInstance,
  diskInfoKey, sortFunc,
} from "@/pages/disk/info/constants.ts";
import {handleDirItemContextmenu} from "@/pages/disk/info/dialog/DirItemContextmenu.tsx";
import {handleDirContextmenu} from "@/pages/disk/info/dialog/DirContextmenu.tsx";
import FileView from "@/pages/disk/info/components/FileView.vue";
import FileIconView from "@/pages/disk/info/components/FileIconView.vue";

// 当前目录
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
// 子目录
const items = ref<Array<DirItem>>([]);
const child = ref<DirItem>();
const loading = ref(false);
const over = ref(false);

const data = computed(() => items.value.sort((a, b) => sortFunc(a, b, diskInfo?.sortType.value || 'name', diskInfo?.orderType.value || 'asc')));

const diskInfo = inject<DiskInfoInstance>(diskInfoKey);

const handleClick = async (item: DirItem) => {
  child.value = item;
  diskInfo?.setPath(item);
};
const handleDrag = async (item: DirItem) => {
  diskInfo?.setDragPath(item.path);
}

function isDescendantOrSelf(sourcePath: string, targetPath: string) {
  return (
    sourcePath === targetPath ||
    targetPath.startsWith(sourcePath + '/') // 子路径以 sourcePath/ 开头
  );
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  const targetPath = props.current.path;
  const dragSourcePath = diskInfo?.getDragPath();
  if (!e.dataTransfer) return;
  if (isDescendantOrSelf(dragSourcePath || '', targetPath)) {
    e.dataTransfer.dropEffect = 'none'; // 禁止放置
  } else {
    e.dataTransfer.dropEffect = 'move'; // 允许放置
  }
  over.value = true;
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault();
  over.value = false;
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  over.value = false;
}

const onRefresh = async (refresh: boolean) => {
  if (loading.value) return;
  loading.value = true;
  try {
    if (props.current.type === 'folder') {
      items.value = await pluginDiskList(props.sourceId, {path: props.current.path, refresh})
      if (!child.value) return;
      if (items.value.every(e => e.path !== child.value?.path)) {
        child.value = undefined;
      }
    }
  } finally {
    loading.value = false
  }
};

watch(() => props.current, () => onRefresh(false), {immediate: true})
</script>
<style scoped lang="less">
.folder-tree-view {
  display: flex;
  width: 100%;
  height: 100%;

  .folder-content {
    flex: 300px;
    width: 300px;
    min-width: 300px;
    max-width: 300px;
    padding: 8px;
    overflow-y: auto;
    border-top: 1px solid transparent;
    border-left: 1px solid transparent;
    border-right: 1px solid var(--td-border-level-2-color);
    border-bottom: 1px solid transparent;
    transition: border-color 0.3s ease-in-out;

    &.over {
      border: 1px solid var(--td-brand-color);
    }

    .dir-item {
      padding: 9px;
      width: 282px;
      border-radius: var(--td-radius-medium);
      transition: background-color 0.3s ease-in-out;
      background-color: var(--td-bg-color-container);
      cursor: pointer;
      font-size: var(--td-font-size-body-small);
      align-items: center;

      &:hover {
        background-color: var(--td-bg-color-container-hover);
      }

      &:active {
        background-color: var(--td-bg-color-container-active);
      }

      &.active {
        background-color: var(--td-bg-color-container-active);
      }

      &.choose {
        background-color: var(--td-brand-color-2);
      }
    }
  }

  .file-items-content {
    flex: auto;
    width: fit-content;
    min-width: 300px;
  }
}
</style>
