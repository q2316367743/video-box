<template>
  <t-tree v-model:actived="folder" activable :data="data" :load="load"></t-tree>
</template>
<script lang="ts" setup>
import {TdTreeProps, TreeOptionData} from "tdesign-vue-next";
import {pluginDiskList} from "@/apis/plugin/disk/list.ts";

const folder = defineModel({
  type: Object as PropType<Array<String>>,
  default: ['/']
})
const props = defineProps({
  sourceId: {
    type: String,
    required: true
  },
});
const data = ref<TdTreeProps["data"]>([{
  value: '/',
  label: '根目录'
}]);

const load: TdTreeProps["load"] = async (node) => {
  const items = await pluginDiskList(props.sourceId, {path: `${node.value}`, refresh: false});
  return items.map(item => {
    return {
      value: item.path,
      label: item.name
    }
  })
}
</script>
<script lang="ts">
/**
 * 磁盘文件夹选择器
 */
export default {
  name: 'DiskFolderSelect'
}
</script>
<style scoped lang="less">

</style>
