<template>
  <t-card class="mt-8px" size="small">
    <markdown-preview :url/>
  </t-card>
</template>
<script lang="ts" setup>
import {DirItem} from "@/apis/plugin/disk/list.ts";
import MarkdownPreview from "@/pages/disk/info/preview/MarkdownPreview.vue";
import {useUserStore} from "@/store/UserStore.ts";

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
