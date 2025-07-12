<template>
  <div class="art-player" ref="art-player"></div>
</template>
<script lang="ts" setup>
import Artplayer from 'artplayer';
import {playFlv} from "@/plugin/ArtPlayerPlugin";

const props = defineProps({
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
    url: '',
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
watch(() => props.url, url => {
  console.log("url", url);
  if (!url) return;
  if (!art.value) return;
  const u = new URL(url);
  if (u.pathname.endsWith('flv')) {
    art.value.type = 'flv';
  } else {
    art.value.type = 'mp4';
  }
  art.value.switchUrl(url);
  art.value.play();
}, {immediate: true})
</script>
<style scoped lang="less">
.art-player {
  width: 100%;
  height: 100%;
}
</style>
