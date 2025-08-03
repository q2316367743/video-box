<template>
  <t-card class="mt-8px" size="small">
    <div class="flex justify-between">
      <t-space size="small">
        <t-button theme="primary" :disabled="current.path === '/'">
          <template #icon>
            <upload-icon/>
          </template>
          上传文件
        </t-button>
        <t-button theme="primary" variant="outline">
          <template #icon>
            <folder-add-icon/>
          </template>
          新建文件夹
        </t-button>
      </t-space>
      <t-space>
        <t-button theme="primary" variant="text" shape="square">
          <template #icon>
            <filter-sort-icon/>
          </template>
        </t-button>
      </t-space>
    </div>
  </t-card>
  <div class="folder-view-content">
    <folder-tree-view :current :source-id="sourceId"/>
  </div>
</template>
<script lang="ts" setup>
import {
  FilterSortIcon,
  FolderAddIcon,
  UploadIcon,
} from "tdesign-icons-vue-next";
import {DirItem} from "@/apis/plugin/disk/list.ts";
import FolderTreeView from "@/pages/disk/info/components/FolderTreeView.vue";

defineProps({
  current: {
    type: Object as PropType<DirItem>,
    required: true
  },
  sourceId: {
    type: String,
    default: ''
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
  height: calc(100vh - 122px);
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
