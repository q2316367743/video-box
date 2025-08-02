<template>
  <t-card class="mt-8px" size="small">
    <video-preview v-if="videoTypes.includes(item.extname || '')" :url :item/>
    <image-preview v-else-if="imageTypes.includes(item.extname || '')" :url :item/>
    <music-preview v-else-if="AUDIO_EXTENSIONS.includes(item.extname || '')" :url :item/>
    <markdown-preview v-else-if="item.extname === 'md'" :url/>
    <code-view v-else-if="CODE_EXTENSIONS.includes(item.extname || '')" :url :item :extname="item.extname"/>
    <unknow-file-view v-else :url="url" :item="item"/>
  </t-card>
</template>
<script lang="ts" setup>
import {DirItem} from "@/apis/plugin/disk/list.ts";
import {useUserStore} from "@/store/UserStore.ts";
import {AUDIO_EXTENSIONS, CODE_EXTENSIONS, imageTypes, videoTypes} from "@/pages/disk/info/constants.ts";
import VideoPreview from "@/pages/disk/info/preview/VideoPreview.vue";
import ImagePreview from "@/pages/disk/info/preview/ImagePreview.vue";
import CodeView from "@/pages/disk/info/preview/CodeView.vue";
import MarkdownPreview from "@/pages/disk/info/preview/MarkdownPreview.vue";
import UnknowFileView from "@/pages/disk/info/preview/UnknowFileView.vue";
import MusicPreview from "@/pages/disk/info/preview/MusicPreview.vue";

const props = defineProps({
  item: {
    type: Object as PropType<DirItem>,
    required: true
  },
  sourceId: {
    type: String,
    required: true
  }
});
const token = computed(() => useUserStore().token);
const url = computed(() => `/api/proxy/disk/${props.sourceId}/p${props.item.path}?authorization=${token.value}`);
</script>
<style scoped lang="less">

</style>
