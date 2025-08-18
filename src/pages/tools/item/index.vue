<template>
  <div class="tool-item">
    <iframe :src="url" frameborder="0" width="100%" height="100%"></iframe>
  </div>
</template>
<script lang="ts" setup>
import { useUserStore } from '@/store/UserStore';

const route = useRoute();

const url = computed(() => `/api/tool/manage/preview/${route.params.id as string}.html?authorization=${useUserStore().token}`)
</script>
<style scoped lang="less">
.tool-item {
  height: 100%;
  width: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;

  :deep(iframe) {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    border: none;
    outline: none;
  }
}
</style>