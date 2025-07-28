<template>
  <div
    class="home-recommend-item">
    <div class="home-recommend-item__cover">
      <img :alt="item.title"
           referrerpolicy="no-referrer" loading="lazy"
           decoding="async" data-nimg="fill"
           class="object-cover"
           :src="item.pic.normal || item.pic.large"
           style="position: absolute; height: 100%; width: 100%; inset: 0; color: transparent;">
      <div
        class="absolute top-2 right-2 bg-pink-500 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ease-out group-hover:scale-110">
        {{ item.rating.value }}
      </div>
    </div>
    <div class="mt-2 text-center">
      <div class="relative"><span class="">{{ item.title }}</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {DouBanRecommendItem} from "@/modules/open/douban/DouBanTvApi";

defineProps({
  item: {
    type: Object as PropType<DouBanRecommendItem>,
    required: true
  }
});
</script>
<style scoped lang="less">
.home-recommend-item {
  width: 218px;
  margin-bottom: 8px;
  position: relative;
  border-radius: var(--td-radius-medium);
  cursor: pointer;
  transition: all 300ms ease-in-out;

  &:hover {
    transform: scale(1.05);
  }

  &__cover {
    width: 218px;
    position: relative;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    border-radius: var(--td-radius-medium);
  }
}
</style>
