<template>
  <div class="random-source-page">
    <div class="page-header">
      <t-space align="center">
        <h2>随机源管理</h2>
        <t-button theme="primary" @click="handleAdd">
          <template #icon><add-icon /></template>
          添加随机源
        </t-button>
      </t-space>
    </div>

    <!-- 随机源列表 -->
    <t-table :data="sourceList" :loading="loading" :columns="columns" row-key="id" stripe hover>
      <template #icon="{ row }">
        <t-avatar v-if="row.icon" :image="row.icon" size="32px" shape="round" />
        <t-icon v-else name="file" size="32px" />
      </template>

      <template #tags="{ row }">
        <t-space>
          <t-tag v-for="tag in row.tags" :key="tag" size="small" variant="light">
            {{ tag }}
          </t-tag>
        </t-space>
      </template>

      <template #is_enabled="{ row }">
        <t-tag :theme="row.is_enabled ? 'success' : 'danger'" variant="light">
          {{ row.is_enabled ? '启用' : '禁用' }}
        </t-tag>
      </template>

      <template #created_at="{ row }">
        {{ toDateString(row.created_at) }}
      </template>

      <template #operation="{ row }">
        <t-space>
          <t-button size="small" variant="text" theme="primary" @click="handleEdit(row)">
            编辑
          </t-button>
          <t-button size="small" variant="text" theme="danger" @click="handleDelete(row)">
            删除
          </t-button>
        </t-space>
      </template>
    </t-table>
  </div>
</template>

<script setup lang="ts">
import { MessagePlugin, DialogPlugin, TableProps } from 'tdesign-vue-next'
import { AddIcon } from 'tdesign-icons-vue-next'
import { adminSourceRandomList, adminSourceRandomDelete } from '@/apis/admin/source/random'
import { openPostDialog } from './components/PostDialog'
import type { SourceRandom } from '@/types/SourceRandom'
import { toDateString } from '@/utils/lang/FormatUtil'

// 响应式数据
const loading = ref(false)
const sourceList = ref<SourceRandom[]>([])

// 表格列配置
const columns: TableProps['columns'] = [
  {
    colKey: 'icon',
    title: '图标',
    width: 80,
  },
  {
    colKey: 'name',
    title: '名称',
    minWidth: 150,
  },
  {
    colKey: 'description',
    title: '描述',
    minWidth: 200,
    ellipsis: true,
  },
  {
    colKey: 'tags',
    title: '标签',
    minWidth: 150,
  },
  {
    colKey: 'is_enabled',
    title: '状态',
    width: 80,
  },
  {
    colKey: 'created_at',
    title: '创建时间',
    width: 180,
  },
  {
    colKey: 'operation',
    title: '操作',
    width: 150,
    fixed: 'right',
  },
]

// 方法
const loadSourceList = async () => {
  try {
    loading.value = true
    const response = await adminSourceRandomList()
    sourceList.value = response || []
  } catch (error) {
    console.error('加载随机源列表失败:', error)
    MessagePlugin.error('加载随机源列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  openPostDialog(loadSourceList)
}

const handleEdit = (row: SourceRandom) => {
  openPostDialog(loadSourceList, row)
}

const handleDelete = async (row: SourceRandom) => {
  const confirmDialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除随机源 "${row.name}" 吗？`,
    theme: 'warning',
    onConfirm: async () => {
      try {
        await adminSourceRandomDelete(row.id)
        MessagePlugin.success('删除成功')
        await loadSourceList()
        confirmDialog.destroy()
      } catch (error) {
        console.error('删除随机源失败:', error)
        MessagePlugin.error('删除随机源失败')
      }
    }
  })
}

// 生命周期
onMounted(() => {
  loadSourceList()
})
</script>

<style scoped lang="less">
.random-source-page {
  padding: 24px;

  .page-header {
    margin-bottom: 24px;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--td-text-color-primary);
    }
  }

  .batch-actions {
    margin-top: 16px;
    padding: 16px;
    background: var(--td-bg-color-container);
    border-radius: var(--td-radius-default);
    border: 1px solid var(--td-component-border);
  }
}

:deep(.t-table) {
  .t-table__header {
    th {
      background-color: var(--td-bg-color-container);
      color: var(--td-text-color-primary);
      font-weight: 600;
    }
  }
}
</style>