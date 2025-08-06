<template>
  <div class="enhanced-image-viewer-example">
    <h2 class="ellipsis">{{ items[0]?.folder || '图片浏览器' }}</h2>

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
  path: {
    type: String,
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
  const { token } = useUserStore();
  const t = props.items.filter(e => IMAGE_EXTENSIONS.includes(e.extname));
  const u = t.map(item => `/api/proxy/disk/${props.sourceId}/p${item.path}?authorization=${token}`)
  initialIndex.value = t.findIndex(item => item.path === props.path);
  urls.value = u;
})

</script>

<style scoped>
.enhanced-image-viewer-example {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  height: calc(100vh - 40px);
  overflow: hidden;
}

.example-container {
  height: calc(100vh - 104px);
  border: 1px solid 1px solid var(--td-border-level-2-color);
  border-radius: 12px;
  margin: 20px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>