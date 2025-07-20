<template>
  <div class="home-recommend">
    <div class="home-recommend-header">
      <div class="home-recommend-title">热门剧集</div>
      <t-button theme="primary" variant="text" @click="tvRefresh" :loading="tvLoading">刷新</t-button>
    </div>
    <div class="home-recommend-content">
      <home-recommend-content :movies="tvRecommendItems" @search="$emit('search', $event)"/>
    </div>
    <div class="home-recommend-header">
      <div class="home-recommend-title">热门电影</div>
      <t-button theme="primary" variant="text" @click="movieRefresh" :loading="movieLoading">刷新</t-button>
    </div>
    <div class="home-recommend-content">
      <home-recommend-content :movies="movieRecommendItems" @search="$emit('search', $event)"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {douBanRecentHotMovie, douBanRecentHotTv} from "@/modules/open/douban/DouBanTvApi.js";
import {useDailyStorage} from "@/hooks/DailyStorage.js";
import {LocalNameEnum} from "@/global/LocalNameEnum.js";
import HomeRecommendContent from "@/pages/home/components/HomeRecommendContent.vue";

defineEmits(['search']);


const {
  data: movieRecommend,
  loading: movieLoading,
  refresh: movieRefresh
} = useDailyStorage(LocalNameEnum.KEY_HOME_RECOMMEND_MOVIE, () => douBanRecentHotMovie(50));

const movieRecommendItems = computed(() => movieRecommend.value?.items || []);
const movieRecommendTags = computed(() => movieRecommend.value?.recommend_tags || []);
const {
  data: tvRecommend,
  loading: tvLoading,
  refresh: tvRefresh
} = useDailyStorage(LocalNameEnum.KEY_HOME_RECOMMEND_TV, () => douBanRecentHotTv(50));

const tvRecommendItems = computed(() => tvRecommend.value?.items || []);
const tvRecommendTags = computed(() => tvRecommend.value?.recommend_tags || []);
</script>
<style scoped lang="less">
.home-recommend {

  .home-recommend-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .home-recommend-title {
    font-size: var(--td-font-size-title-large);
    font-weight: bold;
  }

  .home-recommend-content {
    margin-top: 22px;
  }
}
</style>
