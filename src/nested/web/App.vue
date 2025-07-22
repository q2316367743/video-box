<template>
  <player v-if="video" :v="video" :video-id="videoId" :source-id="sourceId"/>
  <loading-result v-else title="正在获取资源详情"/>
</template>
<script lang="ts" setup>
import MessageUtil from "@/utils/modal/MessageUtil.js";
import {pluginWebDetail} from "@/apis/plugin-web/index.js";
import {VideoDetail} from "@/modules/video/VideoPlugin.js";
import Player from "@/nested/web/components/Player.vue";

const p = new URLSearchParams(location.search);
const sourceId = p.get('source') || '';
const videoId = p.get('video') || '';

const video = ref<VideoDetail>();

onMounted(() => {
  if (!sourceId || !videoId) return MessageUtil.error("参数异常");
  pluginWebDetail(sourceId, videoId)
    .then(v => {
      video.value = v;
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
