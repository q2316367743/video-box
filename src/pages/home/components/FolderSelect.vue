<template>
  <t-select v-model="folderSelect" style="width: 96px" :options="options" size="large"/>
</template>
<script lang="ts" setup>
import {useWebFolderStore} from "@/store/index.js";

const folderSelect = defineModel({
  type: String,
  default: ''
});
const options = computed(() => {
  const {webFolders} = useWebFolderStore();
  const o = [{
    label: '全部',
    value: ''
  }];
  if (webFolders.length > 0) {
    o.push({
      label: '根目录',
      value: 'root'
    })
    o.push(...webFolders.map(f => ({
      label: f.name,
      value: f.id,
    })));
  }
  return o;
})
</script>
<style scoped lang="less">

</style>
