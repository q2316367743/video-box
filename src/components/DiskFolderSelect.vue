<template>
  <t-tree v-model:actived="folder" activable :data="data" :load="load"></t-tree>
</template>
<script lang="ts" setup>
import {TdTreeProps, TreeNodeValue} from "tdesign-vue-next";
import {pluginDiskList} from "@/apis/plugin/disk/list.ts";

const folder = defineModel({
  type: Object as PropType<Array<TreeNodeValue>>,
  default: ['/']
})
const props = defineProps({
  sourceId: {
    type: String,
    required: true
  },
  path: {
    type: String,
    default: ''
  }
});
const data = ref<TdTreeProps["data"]>([{
  value: '/',
  label: '根目录',
  children: true
}]);

const load: TdTreeProps["load"] = async (node) => {
  const items = await pluginDiskList(props.sourceId, {path: `${node.value}`, refresh: false});
  return items.filter(item => item.type === 'folder').map(item => {
    return {
      value: item.path,
      label: item.name,
      children: true,
      disabled: props.path === '' ? false : item.path.startsWith(props.path)
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
