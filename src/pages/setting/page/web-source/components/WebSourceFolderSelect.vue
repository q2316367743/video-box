<template>
  <t-select v-model="modelValue" :options @change="$emit('change')" :disabled="loading" auto-width style="width: fit-content;"/>
</template>
<script lang="ts" setup>
import {Folder} from "@/views/Folder";

const modelValue = defineModel({
  type: String,
  default: ''
});
const props = defineProps({
  folders: {
    type: Array as PropType<Array<Folder>>,
    default: () => []
  },
  root: {
    type: String,
    default: ''
  },
  loading: Boolean
});
defineEmits(['change']);
const options = computed(() => {
  const o = [{
    label: '全部',
    value: 'all'
  }];
  if (props.folders.length > 0) {
    o.push({
      label: '根目录',
      value: props.root
    })
  }
  props.folders.forEach(item => {
    o.push({
      label: item.name,
      value: item.id
    });
  })
  return o;
});
</script>
<style scoped lang="less">

</style>
