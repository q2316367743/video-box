<template>
  <div class="folder-view-content">
    <folder-tree-view v-if="view === 'tree'" :current="root" :source-id="sourceId"/>
    <folder-table-view v-else-if="view === 'table'" :current="current || root" :source-id="sourceId"/>
    <folder-grid-view v-else-if="view === 'grid'" :current="current || root" :source-id="sourceId"/>
  </div>
</template>
<script lang="ts" setup>
import {DirItem} from "@/apis/plugin/disk/list.ts";
import FolderTreeView from "@/pages/disk/info/folder/FolderTreeView.vue";
import FolderTableView from "@/pages/disk/info/folder/FolderTableView.vue";
import FolderGridView from "@/pages/disk/info/folder/FolderGirdView.vue";

defineProps({
  root: {
    type: Object as PropType<DirItem>,
    required: true
  },
  current: {
    type: Object as PropType<DirItem>,
  },
  sourceId: {
    type: String,
    default: ''
  },
  view: {
    type: String,
    default: 'tree'
  }
});

</script>
<style scoped lang="less">
.folder-view-content {
  margin-top: 8px;
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);
  border: 1px solid var(--td-border-level-2-color);
  overflow-x: auto;
  height: calc(100vh - 76px);
}

.folder-item {
  border-radius: var(--td-radius-medium);
  transition: all 0.3s ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: var(--td-bg-color-container-hover);
  }
}
</style>
