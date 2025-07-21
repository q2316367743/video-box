<template>
  <div class="main">
    <player v-if="video && plugin" :default-video="video" :plugin="plugin"/>
    <loading-result v-else title="正在加载中"/>
  </div>
</template>
<script lang="ts" setup>
import {VideoDetail, VideoPlugin} from "@/modules/video/VideoPlugin";
import Player from "@/nested/player/components/Player.vue";

let isInit = false
const video = shallowRef<VideoDetail>();
const plugin = shallowRef<VideoPlugin>();

const subWindow = window.preload.ipcRenderer.buildSubWindow('player');
subWindow.receiveMsg(({event, data}) => {
  if (event === 'initialize') {
    if (isInit) return;
    isInit = true;
    video.value = data.video;
    subWindow.sendMsg({event: 'initialized', data: null})
  }
});
</script>
<style  lang="less">
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
