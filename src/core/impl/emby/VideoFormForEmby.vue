<template>
  <t-form-item label="链接" name="props.url" required-mark :rules="[{required: true}]">
    <t-input v-model="form.url" placeholder="请输入链接"/>
  </t-form-item>
  <t-form-item label="用户名" name="props.username" required-mark :rules="[{required: true}]">
    <t-input v-model="form.username" placeholder="请输入用户名"/>
  </t-form-item>
  <t-form-item label="密码" name="props.password" required-mark :rules="[{required: true}]">
    <t-input type="password" v-model="form.password" placeholder="请输入密码"/>
  </t-form-item>
</template>
<script lang="ts" setup>
import {VideoPluginForEmbyProps} from "@/core/impl/emby/VideoPluginForEmby";

const form = defineModel({
  type: Object as PropType<VideoPluginForEmbyProps>,
  default: () => ({
    url: '',
    username: '',
    password: '',
  })
})
</script>
<style scoped lang="less">

</style>
