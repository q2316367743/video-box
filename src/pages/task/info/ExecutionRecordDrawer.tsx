import {TaskDefinition, TaskExecution} from "@/types/Task.ts";
import {Button, DrawerPlugin, Table, Tag, Tooltip} from "tdesign-vue-next";
import {RefreshIcon} from "tdesign-icons-vue-next";
import {adminTaskExecutionPage} from "@/apis/admin/task.ts";
import {TdTagProps} from "tdesign-vue-next/es/tag/type";
import {toDateTimeString} from "@/utils/lang/FormatUtil.ts";
import {PrimaryTableCol} from "tdesign-vue-next/es/table/type";
import MessageUtil from "@/utils/modal/MessageUtil.ts";

export function openExecutionRecordDrawer(task: TaskDefinition) {
  const taskExecutions = ref<TaskExecution[]>([])
  const executionLoading = ref(false)

  // 分页数据
  const executionPagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showJumper: true,
    showSizer: true,
    pageSizeOptions: [10, 20, 50]
  })

  // 执行记录表格列配置
  const executionColumns: Array<PrimaryTableCol> = [
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
      width: 100
    },
    {
      colKey: 'status',
      title: '状态',
      width: 100
    },
    {
      colKey: 'created_at',
      title: '开始时间',
      width: 160,
      cell: (h, row) => <span>{toDateTimeString(row.row.created_at)}</span>
    },
    {
      colKey: 'finished_at',
      title: '完成时间',
      width: 160,
      cell: (h, row) => <span>{toDateTimeString(row.row.finished_at)}</span>
    }
  ]

  // 加载执行记录
  const loadTaskExecutions = async () => {

    try {
      executionLoading.value = true
      const response = await adminTaskExecutionPage(
        task.id,
        executionPagination.current,
        executionPagination.pageSize
      )
      taskExecutions.value = response.records
      executionPagination.total = response.total
    } catch (error) {
      MessageUtil.error('加载执行记录失败')
      console.error('加载执行记录失败:', error)
    } finally {
      executionLoading.value = false
    }
  }

  // 刷新执行记录
  const refreshExecutions = () => {
    loadTaskExecutions()
  }

  // 执行记录分页变化处理
  const handleExecutionPageChange = (pageInfo: any) => {
    executionPagination.current = pageInfo.current
    executionPagination.pageSize = pageInfo.pageSize
    loadTaskExecutions()
  }

  // 获取触发方式文本
  const getTriggerText = (trigger: string) => {
    const triggerMap: Record<string, string> = {
      cron: '定时',
      manual: '手动',
      internal: '内部'
    }
    return triggerMap[trigger] || trigger
  }

  // 获取执行状态主题
  const getExecutionStatusTheme = (status: string): TdTagProps["theme"] => {
    const themeMap: Record<string, TdTagProps["theme"]> = {
      running: 'primary',
      done: 'success',
      failed: 'danger',
      cancelled: 'warning'
    }
    return themeMap[status] || 'default'
  }

  // 获取执行状态文本
  const getExecutionStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      running: '运行中',
      done: '已完成',
      failed: '失败',
      cancelled: '已取消'
    }
    return textMap[status] || status
  }

  // 监听visible变化，加载数据
  loadTaskExecutions()
  DrawerPlugin({
    size: '60%',
    footer: false,
    header: () => <div class="flex items-center justify-between w-full">
      <h3>{task.name} - 执行记录</h3>
      <Button
        theme="primary"
        size="small"
        onClick={refreshExecutions}
        v-slots={{
          icon: () => <RefreshIcon/>
        }}
      >
        刷新
      </Button>
    </div>,
    default: () => <div>
      <Table
        data={taskExecutions.value}
        columns={executionColumns}
        loading={executionLoading.value}
        rowKey="id"
        pagination={executionPagination}
        onPageChange={handleExecutionPageChange}
        size="small"
        v-slots={{
          trigger: ({row}: { row: TaskExecution }) => getTriggerText(row.trigger),
          status: ({row}: { row: TaskExecution }) => (
            <Tooltip content={row.error} disabled={row.status !== 'failed'}>
              <Tag
                theme={getExecutionStatusTheme(row.status)}
                variant="light"
              >
                {getExecutionStatusText(row.status)}
              </Tag>
            </Tooltip>
          ),
        }}
      />
    </div>
  })
}