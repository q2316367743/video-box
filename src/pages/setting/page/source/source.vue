<template>
  <page-layout title="订阅源设置">
    <template #extra>
      <t-button theme="primary" @click="openVideoSourceDialog">新增</t-button>
    </template>
    <t-list split>
      <t-list-item v-for="source in sources" :key="source.id">
        <t-list-item-meta :title="source.title"></t-list-item-meta>
      </t-list-item>
    </t-list>
  </page-layout>
</template>
<script lang="ts" setup>
import {openVideoSourceDialog} from "@/pages/setting/page/source/VideoSourceDialog";
import {useSourceStore} from "@/store";


const {sources} = toRefs(useSourceStore());
</script>
<style scoped lang="less">

</style>
