<template>
  <div class="ai-source-page">
    <div class="page-header">
      <h2>AI源管理</h2>
      <t-button theme="primary" @click="handleAdd">
        <template #icon>
          <add-icon />
        </template>
        新增AI源
      </t-button>
    </div>

    <!-- AI源列表 -->
    <t-table :data="aiSourceList" :loading="loading" :columns="columns" stripe hover row-key="id">
      <template #driver="{ row }">
        <t-tag theme="primary" variant="light">
          {{ getDriverName(row.driver) }}
        </t-tag>
      </template>

      <template #name="{ row }">
        <t-tooltip v-if="row.description" :content="row.description" placement="top">
          <span>{{ row.name }}</span>
        </t-tooltip>
        <span v-else>{{ row.name }}</span>
      </template>

      <template #token="{ row }">
        <span v-if="row.token">{{ maskToken(row.token) }}</span>
        <span v-else class="text-placeholder">未设置</span>
      </template>

      <template #is_enabled="{ row }">
        <t-tag :theme="row.is_enabled === 1 ? 'success' : 'danger'" variant="light">
          {{ row.is_enabled === 1 ? '启用' : '禁用' }}
        </t-tag>
      </template>

      <template #created_at="{ row }">
        {{ formatTime(row.created_at) }}
      </template>

      <template #operation="{ row }">
        <t-space>
          <t-tooltip content="查看模型">
            <t-button size="small" variant="text" shape="square" @click="showModelListDialog(row)">
              <view-list-icon />
            </t-button>
          </t-tooltip>
          <t-tooltip content="刷新模型">
            <t-button size="small" variant="text" shape="square" :loading="refreshingIds.includes(row.id)"
              @click="handleRefreshModels(row)">
              <refresh-icon />
            </t-button>
          </t-tooltip>
          <t-tooltip content="编辑">
            <t-button size="small" theme="primary" variant="text" shape="square" @click="handleEdit(row)">
              <edit-icon />
            </t-button>
          </t-tooltip>
          <t-tooltip content="删除">
            <t-button size="small" theme="danger" variant="text" shape="square" @click="handleDelete(row)">
              <delete-icon />
            </t-button>
          </t-tooltip>
        </t-space>
      </template>
    </t-table>


  </div>
</template>

<script setup lang="ts">
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  ViewListIcon,
  RefreshIcon
} from 'tdesign-icons-vue-next'
import {
  adminSourceAiList,
  adminSourceAiDel,
  adminSourceAiRefresh
} from '@/apis/admin/source/ai'
import type { SourceAi } from '@/types/SourceAi'
import type { TableProps } from 'tdesign-vue-next'
import { toDateTimeString } from '@/utils/lang/FormatUtil'
import { openAiSourceDialog } from './components/AiSourceDialog'
import { showModelListDialog } from './components/ModelListDialog'

// 响应式数据
const loading = ref(false)
const aiSourceList = ref<SourceAi[]>([])
const refreshingIds = ref<string[]>([])


// 表格列配置
const columns: TableProps['columns'] = [
  { colKey: 'driver', title: '驱动类型', width: 100 },
  { colKey: 'name', title: '名称', width: 120 },
  { colKey: 'url', title: 'URL', width: 200, ellipsis: true },
  { colKey: 'token', title: 'Token', width: 150, ellipsis: true },
  { colKey: 'is_enabled', title: '状态', width: 80 },
  { colKey: 'created_at', title: '创建时间', width: 160 },
  { colKey: 'operation', title: '操作', width: 176, fixed: 'right' }
]


// 生命周期
onMounted(() => {
  loadAiSourceList()
})

// 方法
const loadAiSourceList = async () => {
  try {
    loading.value = true
    const response = await adminSourceAiList()
    aiSourceList.value = response || []
  } catch (error) {
    MessagePlugin.error('加载AI源列表失败')
    console.error('Load AI source list error:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  openAiSourceDialog({
    editData: null,
    onConfirm: () => {
      loadAiSourceList()
    },
    onCancel: () => {}
  })
}

const handleEdit = (row: SourceAi) => {
  openAiSourceDialog({
    editData: row,
    onConfirm: () => {
      loadAiSourceList()
    },
    onCancel: () => {}
  })
}

const handleDelete = async (row: SourceAi) => {
  const confirmDia = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除AI源 "${row.name}" 吗？此操作不可恢复。`,
    confirmBtn: '确定',
    cancelBtn: '取消',
    theme: 'warning',
    onConfirm: async () => {
      try {
        await adminSourceAiDel(row.id)
        MessagePlugin.success('删除成功')
        await loadAiSourceList()
        confirmDia.destroy()
      } catch (error) {
        MessagePlugin.error('删除失败')
        console.error('Delete AI source error:', error)
      }
    }
  })
}

const handleRefreshModels = async (row: SourceAi) => {
  try {
    refreshingIds.value.push(row.id)
    await adminSourceAiRefresh(row.id)
    MessagePlugin.success('模型刷新成功')
  } catch (error) {
    MessagePlugin.error('模型刷新失败')
    console.error('Refresh models error:', error)
  } finally {
    refreshingIds.value = refreshingIds.value.filter(id => id !== row.id)
  }
}



const maskToken = (token: string) => {
  if (!token || token.length <= 8) return token
  return token.substring(0, 4) + '****' + token.substring(token.length - 4)
}

const getDriverName = (driver: number) => {
  switch (driver) {
    case 1:
      return 'OpenAI'
    default:
      return '未知'
  }
}

const formatTime = (timestamp: number) => {
  if (!timestamp) return '-'
  // 如果时间戳是秒级别，需要转换为毫秒
  const time = timestamp < 10000000000 ? timestamp * 1000 : timestamp
  return toDateTimeString(time)
}
</script>

<style scoped lang="less">
.ai-source-page {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--td-text-color-primary);
    }
  }


  .text-placeholder {
    color: var(--td-text-color-placeholder);
  }
}
</style>