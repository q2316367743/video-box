<template>
  <div class="waterfall-item" @click="openOne(r)" :title="r.title">
    <div class="waterfall-item__cover">
      <t-image :src="r.cover" :alt="r.title" lazy fit="cover" style="min-height: 150px">
        <template #error>
          <img src="/video.png" :alt="r.title"/>
        </template>
      </t-image>
      <div class="waterfall-item__tag ellipsis">{{ r.remark }}</div>
    </div>
    <div class="waterfall-item__title ellipsis">{{ r.title }}</div>
    <div class="waterfall-item__remark ellipsis" :title="r.remark">{{ r.remark }}</div>
  </div>
</template>
<script lang="ts" setup>
import {VideoListItem, VideoPlugin} from "@/modules/video/VideoPlugin";
import {usePlayerWindowStore} from "@/store";

const props = defineProps({
  plugin: {
    type: Object as PropType<VideoPlugin>,
    required: true
  },
  r: {
    type: Object as PropType<VideoListItem>,
    required: true
  }
});

const openOne = (item: VideoListItem) => {
  if (!props.plugin) return;
  usePlayerWindowStore().openPlayerWindow(props.plugin.props, item);
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
