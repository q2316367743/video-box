<template>
  <t-loading :loading style="min-height: 200px" text="正在加载中">
    <md-preview :modelValue="text"/>
  </t-loading>
</template>
<script lang="ts" setup>
import {MdPreview} from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';

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
  margin-top: 16px;
}
</style>
