<template>
  <t-form class="p-8px">
    <t-divider>代理设置</t-divider>
    <t-form-item label="是否启用">
      <t-switch v-model="data['/proxy/enable']"/>
    </t-form-item>
    <template v-if="data['/proxy/enable']">
      <t-form-item label="协议">
        <t-radio-group v-model="data['/proxy/protocol']">
          <t-radio value="http">http</t-radio>
          <t-radio value="https">https</t-radio>
          <t-radio value="socks5">socks5</t-radio>
        </t-radio-group>
      </t-form-item>
      <t-form-item label="地址">
        <t-input v-model="data['/proxy/host']"/>
      </t-form-item>
      <t-form-item label="端口">
        <t-input-number v-model="data['/proxy/port']" :min="1" :max="65535"/>
      </t-form-item>
      <t-form-item label="用户名">
        <t-input v-model="data['/proxy/username']"/>
      </t-form-item>
      <t-form-item label="密码">
        <t-input type="password" v-model="data['/proxy/password']"/>
      </t-form-item>
    </template>

    <t-form-item>
      <t-button theme="primary" :loading @click="handleSave">保存</t-button>
    </t-form-item>

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
import {colorMode} from "@/store";
import {adminSettingAll, adminSettingSave} from "@/apis/admin/setting";
import MessageUtil from "@/utils/modal/MessageUtil.ts";


const data = ref<Record<string, any>>({});
const loading = ref(false);

onMounted(() => {
  loading.value = true;
  adminSettingAll()
    .then(res => data.value = res)
    .finally(() => loading.value = false);
});

const handleSave = () => {
  if (loading.value) return;
  loading.value = true;
  adminSettingSave(data.value)
    .then(() => MessageUtil.success("保存成功"))
    .finally(() => loading.value = false);
}
</script>
<style scoped lang="less">

</style>
