<template>
  <page-layout title="网盘源设置">
    <template #extra>
      <t-button theme="primary" @click="addDiskSourceDialog(init)">新增</t-button>
    </template>
    <t-table :columns="columns" v-model:data="items" row-key="id"
             drag-sort="row-handler" :loading
             @drag-sort="onDragSort">
      <template #actions="{ row }">
        <t-space size="small">
          <t-button theme="primary" shape="square" @click="addDiskSourceDialog(init, row)">
            <template #icon>
              <edit-icon/>
            </template>
          </t-button>
          <t-popconfirm content="是否删除？" @confirm="handleDelete(row)">
            <t-button theme="danger" shape="square">
              <template #icon>
                <delete-icon/>
              </template>
            </t-button>
          </t-popconfirm>
        </t-space>
      </template>
    </t-table>
  </page-layout>
</template>
<script lang="ts" setup>
import {TableProps, TdPrimaryTableProps} from "tdesign-vue-next";
import {DeleteIcon, EditIcon, MoveIcon} from "tdesign-icons-vue-next";
import {addDiskSourceDialog} from "@/pages/setting/page/disk-source/dialog/DiskSourceDialog.tsx";
import {adminSourceDiskDelete, adminSourceDiskList, adminSourceDiskOrder} from "@/apis/admin/source/disk.ts";
import {DiskSourceEntry} from "@/types/SourceDisk.ts";
import MessageUtil from "@/utils/modal/MessageUtil.ts";

const columns: TableProps['columns'] = [
  {
    colKey: 'drag',
    // 列拖拽排序必要参数
    title: '排序', cell: (h) => h('span', {}, [h(MoveIcon)])
  },
  {
    title: '名称',
    colKey: 'title'
  },
  {
    title: '类型',
    colKey: 'driver'
  },
  {
    title: '创建日期',
    colKey: 'create_time'
  },
  {
    title: '更新日期',
    colKey: 'update_time'
  },
  {
    title: '操作',
    colKey: 'actions',
    width: 180,
    fixed: 'right',
  }
];

const items = ref(new Array<DiskSourceEntry>());
const loading = ref(false);

const init = () => {
  if (loading.value) return;
  loading.value = true;
  adminSourceDiskList().then(res => items.value = res)
    .finally(() => loading.value = false);
}

const handleDelete = (item: DiskSourceEntry) => {
  // 删除
  adminSourceDiskDelete(item.id).then(() => {
    MessageUtil.success("删除成功");
    init();
  });
}
const onDragSort: TdPrimaryTableProps['onDragSort'] = (params) => {
  adminSourceDiskOrder(params.newData.map((item, i) => ({id: item.id, order: i})))
    .then(() => {
      items.value = params.newData as any;
      MessageUtil.success("移动成功");
    });
}

onMounted(init);
</script>
<style scoped lang="less">

</style>
