<template>
  <empty-result v-if="error" title="影片详情获取失败"/>
  <player v-else-if="video" :v="video" :s="source" :video-id="videoId" :source-id="sourceId" :search-items="searchItems"
          @choose="handleChoose"/>
  <loading-result v-else title="正在获取资源详情"/>
</template>
<script lang="ts" setup>
import MessageUtil from "@/utils/modal/MessageUtil";
import {pluginWebDetail} from "@/apis/plugin/web.ts";
import {VideoDetail} from "@/modules/video/VideoPlugin";
import Player from "@/nested/web/components/Player.vue";
import {SearchResultItem} from "@/pages/home/types/SearchResult";
import {sourceWebInfo} from "@/apis/source/web";
import {SourceWeb} from "@/views/SourceWeb";

const p = new URLSearchParams(location.search);
const sourceId = ref(p.get('source') || '');
const videoId = ref(p.get('video') || '');

const error = ref(false)
const video = ref<VideoDetail>();
const source = ref<SourceWeb>()
const searchItems = ref(new Array<SearchResultItem>());

const init = () => {
  if (!sourceId.value || !videoId.value) return MessageUtil.error("参数异常");
  pluginWebDetail(sourceId.value, videoId.value).then(v => video.value = v).catch(() => error.value = true);
  sourceWebInfo(sourceId.value).then(res => source.value = res)
}

const handleChoose = (index: number) => {
  const item = searchItems.value[index];
  if (!item) return;
  sourceId.value = item.source.id;
  videoId.value = item.item.id;
  error.value = false;
  video.value = undefined;
  nextTick(init);
}


onMounted(() => {
  init();
  window.opener.postMessage('LOADED', location.origin);
  // 接收父窗口发来的 items
  window.addEventListener('message', (e) => {
    if (e.source !== window.opener) return;
    console.log('收到父窗口的 items:', e.data);
    searchItems.value = e.data;
  });
});
</script>
<style scoped lang="less">
#app {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
