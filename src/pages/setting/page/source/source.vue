<template>
  <page-layout title="订阅源设置">
    <template #extra>
      <t-button theme="primary" @click="openVideoSourceDialog()">新增</t-button>
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
            <t-popconfirm content="是否立即删除" confirm-btn="删除" @confirm="removeVideoSource(source)">
              <t-button theme="danger" shape="square" >
                <template #icon>
                  <delete-icon />
                </template>
              </t-button>
            </t-popconfirm>
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
import {VideoSourceEntry} from "@/entities/VideoSource";


const {sources} = toRefs(useSourceStore());

const removeVideoSource = (source: VideoSourceEntry) => {
  useSourceStore().remove(source);
}
</script>
<style scoped lang="less">

</style>
