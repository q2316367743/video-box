<template>
  <web-info-container v-if="plugin" :plugin/>
  <empty-result v-else title="资源不存在"/>
</template>
<script lang="ts" setup>
import {VideoPlugin} from "@/modules/video/VideoPlugin";
import {useVideoSourceStore} from "@/store";
import MessageUtil from "@/utils/modal/MessageUtil";
import {buildVideoPlugin} from "@/modules/video";
import WebInfoContainer from "@/pages/web/pages/info/WebInfoContainer.vue";

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

const plugin = shallowRef<VideoPlugin>();

onMounted(() => {
  const source = useVideoSourceStore().sourceMap.get(id);
  if (!source) {
    router.back();
    return MessageUtil.error("资源不存在");
  }
  plugin.value = buildVideoPlugin(source);
})

</script>
<style scoped lang="less">

</style>
