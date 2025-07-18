<template>
  <div class="home-recommend">
    <div class="home-recommend-title">热门剧集</div>
    <div class="home-recommend-content">
      <home-recommend-item v-for="item in tvRecommendItems" :key="item.id" :item="item" @click="$emit('search', item.title)"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {douBanRecentHotTv, DouBanRecommendItem, DouBanRecommendTag} from "@/modules/open/douban/DouBanTvApi.js";
import HomeRecommendItem from "@/pages/home/components/HomeRecommendItem.vue";

defineEmits(['search']);

const tvRecommendItems = ref(new Array<DouBanRecommendItem>());
const tvRecommendTags = ref(new Array<DouBanRecommendTag>());

onMounted(() => {
  douBanRecentHotTv(50).then(res => {
    const {items, recommend_tags} = res;
    tvRecommendItems.value = items;
    tvRecommendTags.value = recommend_tags;
  })
})
</script>
<style scoped lang="less">
.home-recommend {
  .home-recommend-title {
    font-size: var(--td-font-size-title-large);
    font-weight: bold;
  }

  .home-recommend-content {
    margin-top: 22px;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
