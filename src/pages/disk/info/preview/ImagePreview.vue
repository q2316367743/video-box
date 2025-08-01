<template>
  <t-tabs default-value="preview">
    <t-tab-panel value="preview" label="预览" :destroy-on-hide="false">
      <div class="h-720px object-cover flex mt-8px">
        <t-image-viewer :images="[url]">
          <template #trigger="{ open }">
        <t-image :src="url" style="height: 100%;margin: 0 auto" />
          </template>
        </t-image-viewer>
      </div>
    </t-tab-panel>
    <t-tab-panel value="download" label="下载">
      <unknow-file-view :url :item/>
    </t-tab-panel>
  </t-tabs>
</template>
<script lang="ts" setup>
import UnknowFileView from "@/pages/disk/info/preview/UnknowFileView.vue";
import {DirItem} from "@/apis/plugin/disk/list.ts";

defineProps({
  item: {
    type: Object as PropType<DirItem>,
    required: true
  },
  url: {
    type: String,
    required: true
  }
});
</script>
<style scoped lang="less">

</style>
