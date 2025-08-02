<template>
  <t-loading :loading style="min-height: 200px" text="正在加载中">
    <md-preview :modelValue="text" :theme="isDark ? 'dark' : 'light'"/>
  </t-loading>
</template>
<script lang="ts" setup>
import {MdPreview} from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import {isDark} from "@/store";

const props = defineProps({
  url: {
    type: String,
    required: true
  }
});
const loading = ref(false);
const text = computedAsync(async () => {
  loading.value = true;
  return fetch(props.url)
    .then(res => res.text())
    .finally(() => loading.value = false);
});
</script>
<style scoped lang="less">
:deep(h1) {
  margin-top: 8px;
}
:deep(.md-editor) {
  background-color: transparent;
}
</style>
