<template>
  <div class="main">
    <disk-container v-if="isInit && plugin && info" :index :plugin :info/>
    <loading-result v-else title="正在加载中"/>
  </div>
</template>
<script lang="ts" setup>
import DiskContainer from "@/nested/disk/components/DiskContainer.vue";
import {DiskInfo} from "@/entities/disk/DiskEntry";
import {DiskPlugin} from "@/modules/disk/DiskPlugin";
import {buildDiskPlugin} from "@/modules/disk";

let isInit = ref(false);
const info = ref<DiskInfo>();
const plugin = shallowRef<DiskPlugin>();
const index = ref(0);

const subWindow = window.preload.ipcRenderer.buildSubWindow('disk');
subWindow.receiveMsg(({event, data}) => {
  console.log(event, data);
  if (event === 'initialize') {
    if (isInit.value) return;
    // 直播链接、直播源ID
    info.value = data.info;
    index.value = data.index;
    plugin.value = buildDiskPlugin(data.info);
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
