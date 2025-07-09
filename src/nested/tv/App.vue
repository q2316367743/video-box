<template>
  <div class="main">
    <loading-result title="正在加载中"/>
  </div>
</template>
<script lang="ts" setup>
let isInit = false

const subWindow = window.preload.ipcRenderer.buildSubWindow('tv');
subWindow.receiveMsg(({event, data}) => {
  if (event === 'initialize') {
    if (isInit) return;
    isInit = true;
    // 直播链接、直播源ID
    const {url, sourceId} = data;
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
