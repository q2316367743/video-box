<template>
  <!-- 任务定义表格 -->
  <t-card hover-shadow title="任务列表" style="margin-top: 16px;">
    <template #actions>
      <t-button theme="primary" @click="refreshTaskList">
        <template #icon>
          <refresh-icon/>
        </template>
        刷新
      </t-button>
    </template>
    <t-table
      :data="taskDefinitions"
      :columns="taskColumns"
      :loading="tableLoading"
      row-key="id"
      :pagination="pagination"
      @page-change="handlePageChange"
      hover
      stripe
    >
      <template #actions="{ row }">
        <t-space>
          <t-button
            v-if="row.type === 'preset'"
            theme="primary"
            size="small"
            @click.stop="handleRunTask(row)"
          >
            运行
          </t-button>
          <t-button
            variant="outline"
            size="small"
            @click.stop="openExecutionRecordDrawer(row)"
          >
            执行记录
          </t-button>
        </t-space>
      </template>
    </t-table>
  </t-card>
</template>

<script setup lang="ts">
import {TableProps} from 'tdesign-vue-next'
import {RefreshIcon} from 'tdesign-icons-vue-next'
import {
  adminTaskDefinitionPage,
} from '@/apis/admin/task'
import type {TaskDefinition} from '@/types/Task'
import {openExecutionRecordDrawer} from "@/pages/task/info/ExecutionRecordDrawer.tsx";
import MessageUtil from "@/utils/modal/MessageUtil.ts";
import {prettyDate} from "@/utils/lang/FormatUtil.ts";
import {handleRunTask} from "@/pages/task/dialog/TaskRunDialog.tsx";

// 响应式数据
const taskDefinitions = ref<TaskDefinition[]>([])
const tableLoading = ref(false)

// 分页数据
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
  showSizer: true,
  pageSizeOptions: [10, 20, 50, 100]
})

// 任务定义表格列配置
const taskColumns: TableProps['columns'] = [
  {
    colKey: 'id',
    title: 'ID',
    width: 150,
    ellipsis: true
  },
  {
    colKey: 'name',
    title: '任务名称',
    width: 200,
    ellipsis: true
  },
  {
    colKey: 'type',
    title: '任务类型',
    width: 100,
    cell: (h, row) => {
      return h('span', {}, row.row.type === 'preset' ? '预设任务' : '内部任务')
    }
  },
  {
    colKey: 'schedule',
    title: '调度规则',
    width: 150,
    ellipsis: true,
    cell: (h, row) => h('span', {}, row.row.schedule || '手动执行')
  },
  {
    colKey: 'last_run_at',
    title: '最后执行时间',
    width: 200,
    cell: (h, row) => h('span', {}, prettyDate(row.row.last_run_at))
  },
  {
    colKey: 'actions',
    title: '操作',
    width: 160,
    fixed: 'right'
  }
]


// 加载任务定义列表
const loadTaskDefinitions = async () => {
  try {
    tableLoading.value = true
    const response = await adminTaskDefinitionPage(pagination.current, pagination.pageSize)
    taskDefinitions.value = response.records
    pagination.total = response.total
  } catch (error) {
    MessageUtil.error('加载任务列表失败')
    console.error('加载任务列表失败:', error)
  } finally {
    tableLoading.value = false
  }
}

// 刷新任务列表
const refreshTaskList = () => {
  loadTaskDefinitions()
}

// 分页变化处理
const handlePageChange = (pageInfo: any) => {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  loadTaskDefinitions()
}

// 页面加载时获取任务列表
onMounted(() => {
  loadTaskDefinitions()
});

</script>

<style scoped>

.page-header h2 {
  margin: 0;
  color: var(--td-text-color-primary);
  font-size: 24px;
  font-weight: 600;
}

</style>