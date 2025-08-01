<template>
  <t-tabs default-value="preview">
    <t-tab-panel value="preview" label="预览" :destroy-on-hide="false">
      <div ref="divRef"></div>
    </t-tab-panel>
    <t-tab-panel value="download" label="下载">
      <unknow-file-view :url :item/>
    </t-tab-panel>
  </t-tabs>
</template>
<script lang="ts" setup>
import APlayer from "aplayer";
import {DirItem} from "@/apis/plugin/disk/list.ts";
import UnknowFileView from "@/pages/disk/info/preview/UnknowFileView.vue";

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

const aPlayer = shallowRef<APlayer>();
const divRef = ref();

onMounted(() => {
  aPlayer.value = new APlayer({
    container: divRef.value,
    lrcType: 3,
    autoplay: true,
    audio: [{
      url: props.url,
      artist: '',
      cover: '/logo.png',
      name: props.item.name
    }]
  });
});
onBeforeUnmount(() => {
  aPlayer.value?.destroy();
})
</script>
<style scoped>

</style>
