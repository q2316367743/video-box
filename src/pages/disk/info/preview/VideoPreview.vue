<template>
  <div class="video-preview">
    <div class="video-preview-container">
      <video-viewer v-if="initialIndex > -1" :items="urls" :initial-index="initialIndex"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {DirItem} from '@/apis/plugin/disk/list';
import {useUserStore} from '@/store/UserStore';
import {VIDEO_EXTENSIONS} from '@/global/FileTypeConstant';
import VideoViewer from "@/pages/disk/info/viewer/VideoViewer.vue";

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

interface DirItemWrapper extends DirItem {
  url: string
}

const initialIndex = ref(-1);
const urls = ref(new Array<DirItemWrapper>());

onMounted(() => {
  const u = props.items.filter(e => VIDEO_EXTENSIONS.includes(e.extname)).map(item => ({
    ...item,
    url: useUserStore().getDiskUrl(props.sourceId, item.path)
  }))
  initialIndex.value = u.findIndex(item => item.path === props.current.path);
  urls.value = u;
})

</script>

<style scoped>
.video-preview {
  padding: 12px;
  max-width: 1400px;
  margin: 0 auto;
  height: calc(100% - 24px);
  overflow: hidden;
}

.video-preview-container {
  height: calc(100% - 24px);
  border: 1px solid 1px solid var(--td-border-level-2-color);
  border-radius: 12px;
  margin: 12px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>