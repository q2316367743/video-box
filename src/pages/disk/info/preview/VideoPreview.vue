<template>
  <t-tabs default-value="preview">
    <t-tab-panel value="preview" label="预览" :destroy-on-hide="false">
      <div class="art-player" ref="art-player"></div>
    </t-tab-panel>
    <t-tab-panel value="download" label="下载">
      <unknow-file-view :url :item/>
    </t-tab-panel>
  </t-tabs>
</template>
<script lang="ts" setup>
import Artplayer from 'artplayer';
import {playFlv} from "@/plugin/ArtPlayerPlugin";
import UnknowFileView from "@/pages/disk/info/preview/UnknowFileView.vue";
import {DirItem} from "@/apis/plugin/disk/list.ts";

const props = defineProps({
  item: {
    type: Object as PropType<DirItem>,
    required: true
  },
  url: {
    type: String,
    required: true
  },
});
const art = shallowRef<Artplayer>();
const videoRef = useTemplateRef('art-player');


onMounted(() => {
  if (!videoRef.value) return;
  art.value = new Artplayer({
    container: videoRef.value,
    url: props.url,
    customType: {
      flv: playFlv,
    },
    flip: true,
    playbackRate: true,
    aspectRatio: true,
    screenshot: true,
    fullscreen: true,
    fullscreenWeb: true,
    setting: true,
  });
});
onBeforeUnmount(() => {
  art.value?.destroy();
})
</script>
<style scoped lang="less">
.art-player {
  width: 100%;
  height: 720px;
  margin-top: 8px;
}
</style>
