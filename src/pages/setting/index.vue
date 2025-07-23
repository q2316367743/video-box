<template>
  <t-layout>
    <t-aside style="border-right: 1px solid var(--td-border-level-2-color)">
      <t-menu v-model="active">
        <t-menu-item value="base">基础设置</t-menu-item>
        <t-menu-item value="web">网络资源设置</t-menu-item>
        <t-menu-item value="live">直播设置</t-menu-item>
      </t-menu>
    </t-aside>
    <t-content style="background-color: var(--td-bg-color-container)">
      <router-view/>
    </t-content>
  </t-layout>
</template>
<script lang="ts">
export default defineComponent({
  name: 'setting',
  data: () => ({
    active: 'base'
  }),
  watch: {
    active(val) {
      this.$router.push(`/setting/${val}`);
    }
  }
})
</script>
<style scoped lang="less">

</style>
