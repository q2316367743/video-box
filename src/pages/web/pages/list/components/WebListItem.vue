<template>
  <div class="web-list-item">
    <div class="web-list-item__cover">
      <folder-icon v-if="view.type === 'folder'"/>
      <t-avatar v-else :image="view.cover">{{ view.name.substring(0, 1) }}</t-avatar>
    </div>
    <div class="web-list-item__name ellipsis">{{ view.name }}</div>
  </div>
</template>
<script lang="ts" setup>
import {WebItemView} from "@/pages/web/pages/list/types/WebItem";
import {FolderIcon} from "tdesign-icons-vue-next";

defineProps({
  view: {
    type: Object as PropType<WebItemView>,
    required: true,
  }
});
</script>
<style scoped lang="less">
.web-list-item {
  padding: 0 4px;
  cursor: pointer;
  transition: border 0.3s ease, background-color 0.3s ease;
  border-radius: var(--td-radius-default);
  border: 1px solid transparent;
  background-color: var(--td-bg-color-container);
  user-select: none;

  &:hover {
    border: 1px solid var(--td-border-level-2-color);
    background-color: var(--td-bg-color-container-hover);
  }

  &:active {
    background-color: var(--td-bg-color-container-active);
  }

  .web-list-item__cover {
    height: 48px;
    width: 48px;
    padding: 8px;
    line-height: 48px;
    text-align: center;
  }

  .web-list-item__name {
    text-align: center;
    margin-bottom: 8px;
  }
}
</style>
