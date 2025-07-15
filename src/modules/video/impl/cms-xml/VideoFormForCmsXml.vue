<template>
  <t-form-item label="链接" name="props.url" required-mark :rules="[{required: true}]">
    <t-input v-model="form.url" placeholder="请输入链接" />
  </t-form-item>
</template>
<script lang="ts" setup>
import {VideoPluginForCmsXmlProps} from "@/modules/video/impl/cms-xml/VideoPluginForCmsXml.js";

const form = defineModel({
  type: Object as PropType<VideoPluginForCmsXmlProps>,
  default: () => ({
    url: ''
  })
})
</script>
<style scoped lang="less">

</style>
