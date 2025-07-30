<template>
  <page-layout title="网盘源设置">
    <template #extra>
      <t-button theme="primary" @click="addDiskSourceDialog(init)">新增</t-button>
    </template>
    <t-list>
      <t-list-item v-for="item in items" :key="item.id">
        <t-list-item-meta :title="item.title" :description="item.driver"/>
        <template #action>
          <t-space size="small">
            <t-button theme="primary" shape="square" @click="addDiskSourceDialog(init, item)">
              <template #icon>
                <edit-icon/>
              </template>
            </t-button>
            <t-popconfirm content="是否删除？" @confirm="handleDelete(item)">
              <t-button theme="danger" shape="square">
                <template #icon>
                  <delete-icon/>
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
import {addDiskSourceDialog} from "@/pages/setting/page/disk-source/dialog/DiskSourceDialog.tsx";
import {adminSourceDiskDelete, adminSourceDiskList} from "@/apis/admin/source/disk.ts";
import {DiskSourceEntry} from "@/types/SourceDisk.ts";
import {DeleteIcon, EditIcon} from "tdesign-icons-vue-next";
import MessageUtil from "@/utils/modal/MessageUtil.ts";

const items = ref(new Array<DiskSourceEntry>());

const init = () => adminSourceDiskList().then(res => items.value = res);

onMounted(init);

const handleDelete = (item: DiskSourceEntry) => {
  // 删除
  adminSourceDiskDelete(item.id).then(() => {
    MessageUtil.success("删除成功");
    init();
  });
}
</script>
<style scoped lang="less">

</style>
