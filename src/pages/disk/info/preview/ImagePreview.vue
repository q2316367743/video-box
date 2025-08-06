<template>
  <div class="enhanced-image-viewer-example">
    <div class="example-container">
      <ImageViewer v-if="initialIndex > -1" :image-urls="urls" :initial-index="initialIndex" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { DirItem } from '@/apis/plugin/disk/list';
import ImageViewer from '../viewer/ImageViewer.vue'
import { useUserStore } from '@/store/UserStore';
import { IMAGE_EXTENSIONS } from '@/global/FileTypeConstant';

const props = defineProps({
  sourceId: {
    type: String,
    required: true
  },
  current: {
    type: Object as PropType<DirItem>,
    required: true
  },
  items: {
    type: Object as PropType<Array<DirItem>>,
    required: true
  }
});

const initialIndex = ref(-1);
const urls = ref(new Array<string>());

onMounted(() => {
  const t = props.items.filter(e => IMAGE_EXTENSIONS.includes(e.extname));
  const u = t.map(item => useUserStore().getDiskUrl(props.sourceId, item.path))
  initialIndex.value = t.findIndex(item => item.path === props.current.path);
  urls.value = u;
})

</script>

<style scoped>
.enhanced-image-viewer-example {
  padding: 12px;
  max-width: 1400px;
  margin: 0 auto;
  height: calc(100% - 24px);
  overflow: hidden;
}

.example-container {
  height: calc(100% - 24px);
  border: 1px solid 1px solid var(--td-border-level-2-color);
  border-radius: 12px;
  margin: 12px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>