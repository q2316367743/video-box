<template>
  <div class="main">
    <empty-result v-if="error" title="影片详情获取失败"/>
    <tv-container v-else-if="info" :source-id="sourceId" :video-id="videoId" :info="info"/>
    <loading-result v-else title="正在加载中"/>
  </div>
</template>
<script lang="ts" setup>
import {sourceTvInfo} from "@/apis/source/tv.js";
import {SourceTvInfo} from "@/views/SourceTv.js";
import TvContainer from "@/nested/tv/components/TvContainer.vue";

const p = new URLSearchParams(location.search);
const sourceId = p.get('source') || '';
const videoId = p.get('video') || '';

const error = ref(false)
const info = ref<SourceTvInfo>();

onMounted(() => {
  sourceTvInfo(sourceId).then(res => info.value = res).catch(() => error.value = true);
})
</script>
<style lang="less">
#app {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.main {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  color: var(--td-text-color-primary);
  background-color: var(--td-bg-color-container);
}
</style>
