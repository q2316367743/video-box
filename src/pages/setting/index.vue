<template>
  <app-page v-model="active" :menus>
    <router-view/>
  </app-page>
</template>
<script lang="ts">
import AppPage from "@/layout/AppPage.vue";

export default defineComponent({
  name: 'setting',
  components: {AppPage},
  data: () => ({
    active: '/setting/base',
    menus: [{
      value: '/setting/base',
      label: '基础设置'
    }, {
      value: '/setting/web',
      label: '网络资源设置'
    }, {
      value: '/setting/folder',
      label: '文件夹设置'
    }, {
      value: '/setting/live',
      label: '直播设置'
    }]
  }),
})
</script>
<style scoped lang="less">

</style>
