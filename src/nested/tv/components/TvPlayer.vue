<template>
  <div class="art-player" ref="art-player"></div>
</template>
<script lang="ts" setup>
import Artplayer from 'artplayer';
import {playM3u8} from "@/plugin/ArtPlayerPlugin";

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
    type: 'm3u8',
    customType: {
      m3u8: playM3u8
    },
    flip: true,
    isLive: true,
    playbackRate: true,
    aspectRatio: true,
    screenshot: true,
    fullscreen: true,
    fullscreenWeb: true,
    setting: true,
  });
});
watch(() => props.url, async url => {
  if (!art.value) return;
  await art.value.switchUrl(url);
  await art.value.play()
}, {immediate: true})
</script>
<style scoped lang="less">
.art-player {
  width: 100%;
  height: 100%;
}
</style>
