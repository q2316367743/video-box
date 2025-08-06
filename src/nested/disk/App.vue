<template>
  <div class="main">
    <image-viewer-example v-if="current && IMAGE_EXTENSIONS.includes(current.extname)" :items="items"
      :source-id="sourceId" :path="path"/>
    <unknown-viewer v-else-if="current" :item="current" :source-id="sourceId" />
    <loading-result v-else title="加载失败" />
  </div>
</template>
<script lang="ts" setup>
import { useColorMode } from "@/hooks/ColorMode";
import ImageViewerExample from './components/ImageViewerWrapper.vue';
import { DirItem, pluginDiskBrother } from "@/apis/plugin/disk/list";
import MessageUtil from "@/utils/modal/MessageUtil";
import { IMAGE_EXTENSIONS } from '@/global/FileTypeConstant';
import UnknownViewer from "./viewer/UnknownViewer.vue";


const p = new URLSearchParams(location.search);
const sourceId = p.get('id') || '';
const path = decodeURIComponent(p.get('path') || '');

const items = ref(new Array<DirItem>());
const current = computed(() => items.value.find(e => e.path === path));

onMounted(() => {
  if (!sourceId) return MessageUtil.error("云盘来源未知");
  if (!path) return MessageUtil.error("文件路径未知");
  pluginDiskBrother(sourceId, path).then((res) => items.value = res);
})

useColorMode();
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
  overflow: auto;
}
</style>
