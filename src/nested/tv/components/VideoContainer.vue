<template>
  <div class="video-container"></div>
</template>
<script lang="ts" setup>
import {useLiveSourceStore} from "@/store";
import {LiveSourceInfo} from "@/entities/LiveSource";

const props = defineProps({
  defaultUrl: {
    type: String,
    required: true
  },
  sourceId: {
    type: Number,
    required: true
  }
});
const info = shallowRef<LiveSourceInfo>();
const url = ref(props.defaultUrl);

onMounted(async () => {
  // 获取视频源
  await useLiveSourceStore().init();
  info.value = await useLiveSourceStore().getChannel(props.sourceId);
})
</script>
<style scoped lang="less">

</style>
