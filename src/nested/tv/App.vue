<template>
  <div class="main">
    <tv-container v-if="isInit" :source-id="sourceId" :default-url="defaultUrl"/>
    <loading-result v-else title="正在加载中"/>
  </div>
</template>
<script lang="ts" setup>
import TvContainer from "@/nested/tv/components/TvContainer.vue";

let isInit = ref(false);
const sourceId = ref(0);
const defaultUrl = ref('');

const subWindow = window.preload.ipcRenderer.buildSubWindow('tv');
subWindow.receiveMsg(({event, data}) => {
  console.log(event, data);
  if (event === 'initialize') {
    if (isInit.value) return;
    // 直播链接、直播源ID
    sourceId.value = data.sourceId;
    defaultUrl.value = data.url;
    isInit.value = true;
    subWindow.sendMsg({event: 'initialized', data: null})
  }
});
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
