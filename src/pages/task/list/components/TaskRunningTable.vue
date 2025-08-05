<template>
  <t-card hover-shadow title="正在执行中" class="mt-16px">
    <t-table
      :data="data"
      :columns="columns"
      row-key="id"
      hover
      stripe
    />
  </t-card>
</template>

<script setup lang="ts">
import type {TaskExecution} from '@/types/Task'
import {useUserStore} from "@/store/UserStore.ts";
import {PrimaryTableCol} from "tdesign-vue-next/es/table/type";
import {toDateTimeString} from "@/utils/lang/FormatUtil.ts";
import {Progress} from "tdesign-vue-next";

const columns: Array<PrimaryTableCol> = [
  {
    colKey: 'id',
    title: '执行ID',
    width: 120,
    ellipsis: true
  },
  {
    colKey: 'identifier',
    title: '标识符',
    width: 150,
    ellipsis: true
  },
  {
    colKey: 'trigger',
    title: '触发方式',
    width: 100,
    cell: (h, row) => {
      let text: string;
      switch (row.row.trigger) {
        case 'cron':
          text = '定时任务';
          break;
        case 'manual':
          text = '手动执行';
          break;
        case 'internal':
          text = '内部任务';
          break;
        default:
          text = '未知';
      }
      return h('span', {}, text)
    }
  },
  {
    colKey: 'status',
    title: '状态',
    width: 100,
    cell: (h, row) => {
      let text: string;
      let color = '';
      switch (row.row.status) {
        case 'running':
          text = '运行中';
          break;
        case 'done':
          text = '已完成';
          color = 'var(--td-success-color)';
          break;
        case 'failed':
          text = '已失败';
          color = 'var(--td-error-color)';
          break;
        case 'cancelled':
          text = '已取消';
          color = 'var(--td-warning-color)';
          break;
        default:
          text = '未知';
      }
      return h('span', {style: {color}}, text)
    }
  },
  {
    colKey: 'progress',
    title: '进度',
    width: 200,
    cell: (h, row) => h(Progress, {percentage: row.row.progress})
  },
  {
    colKey: 'created_at',
    title: '开始时间',
    width: 160,
    cell: (h, row) => h('span', {}, toDateTimeString(row.row.created_at))
  },
]
const data = ref(new Array<TaskExecution>());

const eventSource = new EventSource(`${location.origin}/api/admin/task/running?authorization=${useUserStore().token}`);

// 页面加载时获取任务列表
onMounted(() => {
  eventSource.addEventListener('taskList', e => {
    data.value = JSON.parse(e.data) as Array<TaskExecution>;
  });
});
onBeforeUnmount(() => {
  eventSource.close();
})

</script>

<style scoped>

</style>