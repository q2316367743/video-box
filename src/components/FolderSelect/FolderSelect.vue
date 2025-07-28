<template>
  <t-select v-model="folderSelect" :options="options" :size/>
</template>
<script lang="ts" setup>
import {folderWebList} from "@/apis/folder-web/index";
import {SelectOption} from "tdesign-vue-next";

const folderSelect = defineModel({
  type: String,
  default: ''
});
const props = defineProps({
  size: {
    type: String as PropType<'small' | 'medium' | 'large'>,
    default: "medium"
  },
  all: {
    type: Boolean,
    default: true
  },
});
const options = ref<Array<SelectOption>>([]);

onMounted(() => {
  if (props.all) {
    // 显示全部
    options.value.push({
      label: '全部',
      value: 'all'
    });
  }
  folderWebList().then(webFolders => {
    if (webFolders.length > 0) {
      options.value.push({
        label: '根目录',
        value: 'root'
      })
      options.value.push(...webFolders.map(f => ({
        label: f.name,
        value: f.id,
      })));
    }
  })
})
</script>
<style scoped lang="less">

</style>
