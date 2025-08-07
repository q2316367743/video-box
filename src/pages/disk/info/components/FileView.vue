<template>
  <div class="relative w-full h-full overflow-hide">
    <unknown-file-view v-if="unknown" :item="current" :source-id="sourceId"/>
    <loading-result v-else-if="loading" title="文件加载中"/>
    <image-preview v-else-if="isImage" :current="current" :items="data" :source-id="sourceId"/>
    <audio-preview v-else-if="isAudio" :current="current" :items="data" :source-id="sourceId"/>
    <video-preview v-else-if="isVideo" :current="current" :items="data" :source-id="sourceId"/>
    <code-preview v-else-if="isCode" :current="current" :source-id="sourceId"/>
    <empty-result v-else title="系统异常"/>
  </div>
</template>
<script lang="ts" setup>
import {DirItem, pluginDiskBrother} from "@/apis/plugin/disk/list.ts";
import {AUDIO_EXTENSIONS, CODE_EXTENSIONS, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS} from "@/global/FileTypeConstant";
import UnknownFileView from "../preview/UnknownFileView.vue";
import ImagePreview from "../preview/ImagePreview.vue";
import CodePreview from "../preview/CodePreview.vue";
import AudioPreview from "../preview/AudioPreview.vue";
import VideoPreview from "@/pages/disk/info/preview/VideoPreview.vue";
import {DiskInfoInstance, diskInfoKey, sortFunc} from "@/pages/disk/info/constants.ts";

const props = defineProps({
  current: {
    type: Object as PropType<DirItem>,
    required: true
  },
  sourceId: {
    type: String,
    required: true
  }
});

const isVideo = VIDEO_EXTENSIONS.includes(props.current.extname);
const isImage = IMAGE_EXTENSIONS.includes(props.current.extname);
const isAudio = AUDIO_EXTENSIONS.includes(props.current.extname);
const isCode = CODE_EXTENSIONS.includes(props.current.extname);
const unknown = !isVideo && !isImage && !isAudio && !isCode;

const loading = ref(true);

const items = ref<Array<DirItem>>([]);

const diskInfo = inject<DiskInfoInstance>(diskInfoKey);
const data = computed(() => items.value.sort((a, b) => sortFunc(a, b, diskInfo?.sortType.value || 'name', diskInfo?.orderType.value || 'asc')));

onMounted(() => {
  if (isVideo || isImage || isAudio) {
    pluginDiskBrother(props.sourceId, props.current.path)
      .then(res => items.value = res)
      .finally(() => loading.value = false);
  } else {
    loading.value = false;
  }

})

</script>
<style scoped lang="less"></style>
