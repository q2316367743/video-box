<template>
  <div class="search-item flex">
    <img style="width: 72px;height: 108px;" :src="item.item.cover" :alt="item.item.title" />
    <div class="search-item-info">
      <div class="search-item__title">{{ item.item.title }}</div>
      <div class="search-item__remark">{{ item.item.remark }}</div>
      <div class="mt-auto">
        <t-button theme="primary" :disabled="videoId == item.item.id && sourceId === item.source.id"
          @click="$emit('choose')">切换
        </t-button>
      </div>
      <div class="search-item__source">
        <t-tag theme="primary">{{ item.source.title }}</t-tag>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { SearchResultItem } from "@/pages/home/types/SearchResult";

defineProps({
  sourceId: String,
  videoId: String,
  item: {
    type: Object as PropType<SearchResultItem>,
    required: true
  }
})
defineEmits(['choose']);
</script>
<style scoped lang="less">
.search-item {
  padding: 6px 3px;
  border-bottom: 1px solid var(--td-border-level-2-color);
  position: relative;

  &:last-child {
    border-bottom: none;
  }

  .search-item-info {
    margin-left: 16px;
    flex: auto;
    display: flex;
    flex-direction: column;
  }

  .search-item__title {
    font-size: var(--td-font-size-title-large);
  }

  .search-item__remark {
    margin-top: 8px;
    font-size: var(--td-font-size-body-small);
    color: var(--td-text-color-secondary);
  }

  .search-item__source {
    position: absolute;
    top: 0;
    right: 0;
  }
}
</style>
