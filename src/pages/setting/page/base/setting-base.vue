<template>
  <t-form class="p-8px">
    <t-divider>代理设置</t-divider>
    <t-form-item label="是否启用">
      <t-switch v-model="useBaseSettingStore.proxy.isEnabled"/>
    </t-form-item>
    <template v-if="useBaseSettingStore.proxy.isEnabled">
      <t-form-item label="协议">
        <t-radio-group v-model="useBaseSettingStore.proxy.protocol">
          <t-radio value="http">http</t-radio>
          <t-radio value="https">https</t-radio>
          <t-radio value="socks5">socks5</t-radio>
        </t-radio-group>
      </t-form-item>
      <t-form-item label="地址">
        <t-input v-model="useBaseSettingStore.proxy.host"/>
      </t-form-item>
      <t-form-item label="端口">
        <t-input-number v-model="useBaseSettingStore.proxy.port" :min="1" :max="65535"/>
      </t-form-item>
      <t-form-item label="用户名">
        <t-input v-model="useBaseSettingStore.proxy.username"/>
      </t-form-item>
      <t-form-item label="密码">
        <t-input type="password" v-model="useBaseSettingStore.proxy.password"/>
      </t-form-item>
    </template>
    <t-form-item label="颜色模式">
      <t-radio-group v-model="colorMode">
        <t-radio value="auto" label="自动"/>
        <t-radio value="light" label="白天"/>
        <t-radio value="dark" label="黑夜"/>
      </t-radio-group>
    </t-form-item>
  </t-form>
</template>
<script lang="ts" setup>
import {useBaseSettingStore} from "@/store/db/BaseSettingStore";
import {colorMode} from "@/store/index.js";
</script>
<style scoped lang="less">

</style>
