<template>
  <t-form-item label="链接" name="props.url" required-mark :rules="[{required: true}]">
    <t-input v-model="form.url" placeholder="请输入链接" />
  </t-form-item>
</template>
<script lang="ts" setup>
import {VideoPluginForCmsJsonProps} from "@/modules/video/impl/cms-json/VideoPluginForCmsJson";

const form = defineModel({
  type: Object as PropType<VideoPluginForCmsJsonProps>,
  default: () => ({
    url: ''
  })
})
</script>
<style scoped lang="less">

</style>
