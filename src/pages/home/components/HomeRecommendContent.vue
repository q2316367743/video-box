<template>
  <div class="movie-scroll-container">
    <div class="scroll-wrapper">
      <button
        v-if="canScrollLeft"
        class="scroll-btn prev"
        @click="scrollPage('left')"
      >
        ‹
      </button>

      <div class="movie-list" ref="scrollContainer">
        <home-recommend-item v-for="item in movies" :key="item.id" :item="item"
                             @click="$emit('search', item.title)"/>
      </div>

      <button
        v-if="canScrollRight"
        class="scroll-btn next"
        @click="scrollPage('right')"
      >
        ›
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {DouBanRecommendItem} from "@/modules/open/douban/DouBanTvApi";
import HomeRecommendItem from "@/pages/home/components/HomeRecommendItem.vue";

defineProps({
  movies: {
    type: Object as PropType<Array<DouBanRecommendItem>>,
    required: true
  }
});
defineEmits(['search']);
const scrollContainer = ref<HTMLDivElement>();
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

const checkScrollState = () => {
  if (!scrollContainer.value) return;
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value;
  canScrollLeft.value  = scrollLeft > 0;
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 1;
};

const scrollPage = (direction: string) => {
  if (!scrollContainer.value) return;
  const width = scrollContainer.value.clientWidth;   // ← 关键：整屏宽度
  scrollContainer.value.scrollBy({
    left: direction === 'left' ? -width : width,
    behavior: 'smooth'
  });
};

onMounted(() => {
  nextTick(() => {
    checkScrollState();
    scrollContainer.value?.addEventListener('scroll', checkScrollState);
    window.addEventListener('resize', checkScrollState);
  });
});
onBeforeUnmount(() => {
  scrollContainer.value?.removeEventListener('scroll', checkScrollState);
  window.removeEventListener('resize', checkScrollState);
})
</script>
<style>

.movie-scroll-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

.scroll-wrapper {
  position: relative;
  overflow: hidden;
}

.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 18px;
}

.scroll-btn:hover {
  background-color: rgba(0, 0, 0, 0.9);
  transform: translateY(-50%) scale(1.1);
}

.scroll-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: translateY(-50%) scale(1);
}

.scroll-btn.prev {
  left: 10px;
}

.scroll-btn.next {
  right: 10px;
}

.movie-list {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 8px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.movie-list::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

</style>