<template>
  <page-layout title="订阅源设置">
    <template #extra>
      <t-button theme="primary" @click="openVideoSourceDialog">新增</t-button>
    </template>
    <t-list split>
      <t-list-item v-for="source in sources" :key="source.id">
        <t-list-item-meta :title="source.title"></t-list-item-meta>
        <template #action>
          <t-space size="small">
            <t-button theme="primary" shape="square" @click="openVideoSourceDialog(source)">
              <template #icon>
                <edit-icon />
              </template>
            </t-button>
            <t-button theme="danger" shape="square" @click="openVideoSourceDialog(source)">
              <template #icon>
                <delete-icon />
              </template>
            </t-button>
          </t-space>
        </template>
      </t-list-item>
    </t-list>
  </page-layout>
</template>
<script lang="ts" setup>
import {openVideoSourceDialog} from "@/pages/setting/page/source/VideoSourceDialog";
import {useSourceStore} from "@/store";
import {DeleteIcon, EditIcon} from "tdesign-icons-vue-next";


const {sources} = toRefs(useSourceStore());
</script>
<style scoped lang="less">

</style>
