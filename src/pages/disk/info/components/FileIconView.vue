<template>
  <div class="file-icon-view">
    <folder-icon v-if="type === 'folder'"/>
    <audio-icon v-else-if="type === 'file' && AUDIO_EXTENSIONS.includes(extname || '')"/>
    <video-icon v-else-if="type === 'file' && VIDEO_EXTENSIONS.includes(extname || '')"/>
    <image-icon v-else-if="type === 'file' && IMAGE_EXTENSIONS.includes(extname || '')"/>
    <txt-icon v-else-if="type === 'file' && CODE_EXTENSIONS.includes(extname || '')"/>
    <file-icon v-else-if="type === 'file'"/>
  </div>
</template>
<script lang="ts" setup>
import VideoIcon from "@/assets/svg/video.svg";
import ImageIcon from "@/assets/svg/image.svg";
import FolderIcon from "@/assets/svg/folder.svg";
import TxtIcon from "@/assets/svg/txt.svg";
import AudioIcon from "@/assets/svg/audio.svg";
import FileIcon from "@/assets/svg/file.svg";
import {AUDIO_EXTENSIONS, CODE_EXTENSIONS, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS} from "@/global/FileTypeConstant.ts";

defineProps({
  size: {
    type: String,
    default: '16px'
  },
  type: {
    type: String as PropType<'file' | 'folder' | 'unknow'>,
    default: 'unknow'
  },
  extname: {
    type: String,
    default: ''
  }
});
</script>
<style scoped lang="less">
.file-icon-view {
  width: v-bind(size);
  height: v-bind(size);

  :deep(svg) {
    width: 100%;
    height: 100%;
  }
}
</style>
