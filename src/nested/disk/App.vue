<template>
  <div class="main">
    <disk-container v-if="isInit && info" :index  :info/>
    <loading-result v-else title="正在加载中"/>
  </div>
</template>
<script lang="ts" setup>
import DiskContainer from "@/nested/disk/components/DiskContainer.vue";
import {DiskInfo} from "@/entities/disk/DiskEntry";

let isInit = ref(false);
const info = ref<DiskInfo>();
const index = ref(0);

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
