<template>
  <div class="web-list-add">
    <div class="web-list-item__cover">
      <plus-icon/>
    </div>
    <div class="web-list-item__name ellipsis">新增</div>
  </div>
</template>
<script lang="ts" setup>
import {PlusIcon} from "tdesign-icons-vue-next";
</script>
<style scoped lang="less">
.web-list-add {
  padding: 16px 18px 8px;
  cursor: pointer;
  transition: all 0.3s ease;
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
    height: 32px;
    width: 32px;
    line-height: 32px;
    text-align: center;
    border: 1px solid var(--td-border-level-2-color);
    border-radius: var(--td-radius-circle);
  }

  .web-list-item__name {
    text-align: center;
    margin-top: 14px;
  }
}
</style>
