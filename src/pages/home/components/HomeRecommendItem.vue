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
      <div class="relative"><span
        class="block text-sm font-semibold truncate text-gray-900 dark:text-gray-100 transition-colors duration-300 ease-in-out group-hover:text-green-600 dark:group-hover:text-green-400 peer">{{
          item.title
        }}</span>
        <div
          class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all duration-200 ease-out delay-100 whitespace-nowrap pointer-events-none">
          {{ item.title }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {DouBanRecommendItem} from "@/modules/open/douban/DouBanTvApi.js";

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
