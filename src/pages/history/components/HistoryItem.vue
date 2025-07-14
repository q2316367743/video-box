<template>
  <div class="waterfall-item" @click="openOne(item)" :title="item.title">
    <div class="waterfall-item__cover">
      <t-image :src="item.cover" :alt="item.title" lazy fit="cover" style="min-height: 150px">
        <template #error>
          <img src="/video.png" :alt="item.title"/>
        </template>
      </t-image>
      <div class="waterfall-item__tag ellipsis">{{ item.description }}</div>
    </div>
    <div class="waterfall-item__title ellipsis">{{ item.title }}</div>
    <div class="waterfall-item__remark ellipsis" :title="item.description">{{ item.description }}</div>
  </div>
</template>
<script lang="ts" setup>
import {PlayHistoryItem} from "@/entities/PlayHistoryItem.js";
import {usePlayHistoryStore} from "@/store/db/PlayHistoryStore.js";
import {usePlayerWindowStore, useTvWindowStore} from "@/store/index.js";
import {useDiskWindowStore} from "@/store/component/DiskWindowStore.js";
import MessageUtil from "@/utils/modal/MessageUtil.js";

defineProps({
  item: {
    type: Object as PropType<PlayHistoryItem>,
    required: true
  },
});

const openOne = (item: PlayHistoryItem) => {
  usePlayHistoryStore().getContent(item.id).then(content => {
    const {type, payload} = content;
    switch (type) {
      case "web":
        usePlayerWindowStore().openPlayerWindow(payload.source, payload.video);
        break;
      case "disk":
        useDiskWindowStore().openDiskWindow(payload.info, payload.index);
        break;
      case "tv":
        useTvWindowStore().openTvWindow(payload.sourceId, payload.item);
        break;
      default:
        MessageUtil.error(`系统异常,播放类型「${type}」错误`)
    }
  })
}
</script>
<style scoped lang="less">
.waterfall-item {
  break-inside: avoid;
  position: relative;
  cursor: pointer;
  margin-bottom: 12px;
  display: inline-block;
  width: 100%;

  &__cover {
    position: relative;
    overflow: hidden;
    border-radius: var(--td-radius-medium);

    :deep(img) {
      transition: transform 0.3s ease;
    }
  }

  &__tag {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    background-color: #ffdd9a;
    max-width: 80%;
    padding: 3px 6px;
    color: #4f3007;
    font-weight: bold;
    border-radius: var(--td-radius-medium) 0;
    font-size: var(--td-font-size-body-medium);
    user-select: none;
  }

  &__title {
    margin-top: 4px;
    font-size: var(--td-font-size-title-medium);
    font-weight: bold;
    color: var(--td-text-color-primary);
    transition: color 0.3s ease;
  }

  &__remark {
    margin-top: 2px;
    font-size: var(--td-font-body-medium);
    color: var(--td-text-color-secondary);
  }

  &:hover {
    .waterfall-item__cover :deep(img) {
      transform: scale(1.02);
    }

    .waterfall-item__title {
      color: var(--td-brand-color);
    }
  }
}
</style>
