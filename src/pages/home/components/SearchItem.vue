<template>
  <t-card size="small" hover-shadow class="search-item">
    <div class="flex items-start">
      <div class="flex-shrink-0 mr-4">
        <img :src="video.cover" :alt="video.title" class="w-24 h-36 object-cover rounded"/>
      </div>

      <div class="flex-1">
        <div class="font-semibold text-lg">{{ video.title }}</div>
        <div class="text-gray-600 mb-2">{{ video.remark }}</div>

        <div class="flex items-center text-sm text-gray-500">
          <t-tag theme="primary" variant="light">
            {{ item.results.length }}个相似资源
          </t-tag>
        </div>

        <div class="mt-3 flex space-x-2">
          <t-button theme="primary">立即观看</t-button>
          <t-button variant="outline">收藏</t-button>
        </div>
      </div>
    </div>
    <div class="select">
      <t-select v-model="active" :options auto-width/>
    </div>
  </t-card>
</template>
<script lang="ts" setup>
import {SearchResult, SearchResultDisplay} from "@/pages/home/types/SearchResult.js";

const props = defineProps({
  item: {
    type: Object as PropType<SearchResult>,
    required: true
  }
});

const active = ref(0);
const video = ref<SearchResultDisplay>(props.item);

const options = computed(() => {
  const {item} = props;
  return item.results.map((r, i) => ({
    label: r.source.title,
    value: i
  }));
});

watch(active, val => {
  const target = props.item.results[val];
  if (target) {
    video.value = target.item;
  }
})
</script>
<style scoped lang="less">
.search-item {
  display: flex;
  align-items: flex-start;
  width: 100%;
  margin-top: 8px;
  position: relative;

  &:hover {
    .movie-title {
      color: var(--td-brand-color);
    }
  }

  .movie-cover {
    width: 100px;
    height: 150px;
    object-fit: cover;
    margin-right: 16px;
  }

  .movie-info {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    .movie-title {
      font-size: 24px;
      font-weight: bold;
      color: var(--td-text-color-primary);
    }

    .movie-subtitle {
      margin-top: 8px;
      font-size: 16px;
      color: var(--td-text-color-secondary);
    }
  }

  .select {
    position: absolute;
    top: 8px;
    right: 16px;
  }

}

</style>
