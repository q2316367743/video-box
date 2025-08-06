<template>
  <div class="enhanced-image-viewer-example">
    <code-viewer :url="url" :extname="current.extname" :name="current.name"/>
  </div>
</template>

<script setup lang="ts">
import { DirItem } from '@/apis/plugin/disk/list';
import { useUserStore } from '@/store/UserStore';
import CodeViewer from "@/pages/disk/info/viewer/CodeViewer.vue";

const props = defineProps({
  sourceId: {
    type: String,
    required: true
  },
  current: {
    type: Object as PropType<DirItem>,
    required: true
  },
});

const url = computed(() => useUserStore().getDiskUrl(props.sourceId, props.current.path))

</script>

<style scoped>
.enhanced-image-viewer-example {
  padding: 12px;
  max-width: 1400px;
  margin: 0 auto;
  height: calc(100% - 24px);
  overflow: hidden;
}
</style>