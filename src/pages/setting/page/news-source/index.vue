<template>
  <div class="news-source-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">资讯源管理</h2>
      </div>
      <div class="header-right">
        <t-button theme="primary" @click="handleAdd">
          <template #icon>
            <AddIcon />
          </template>
          新增资讯源
        </t-button>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <t-card class="search-card">
      <t-input v-model="searchForm" placeholder="请输入资讯源名称" clearable style="width: 400px" />
    </t-card>

    <!-- 数据表格区域 -->
    <t-card class="table-card">

      <!-- 表格 -->
      <t-table ref="tableRef" :data="tableData" :columns="columns" :loading="loading" row-key="id" select-on-row-click
        @page-change="handlePageChange" :pagination="pagination" />
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { Button, type FormRule, PrimaryTableProps, Tag } from 'tdesign-vue-next'
import { AddIcon, SearchIcon } from 'tdesign-icons-vue-next'
import { useFuse } from '@vueuse/integrations/useFuse'
import {
  adminSourceNewsList,
  adminSourceNewsDelete,
  adminSourceNewsEnable,
} from '@/apis/admin/source/news'
import type { SourceNews, SourceNewsPost, SourceNewsType } from '@/types/SourceNews'
import { openPostDialog } from './components/PostDialog'
import MessageBoxUtil from '@/utils/modal/MessageBoxUtil'
import MessageUtil from '@/utils/modal/MessageUtil'


// 响应式数据
const loading = ref(false)
const originalData = ref<SourceNews[]>([])

// 搜索表单
const searchForm = ref('')

// 使用 useFuse 进行模糊搜索
const { results } = useFuse(() => searchForm.value, originalData, {
  fuseOptions: {
    keys: ['title', 'tag'],
    threshold: 0.3
  },
  matchAllWhenSearchEmpty: true
})

// 计算过滤后的数据
const tableData = computed(() => results.value.map(result => result.item))


// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: computed(() => tableData.value.length),
  showJumper: true,
  showSizeChanger: true
})

// 表格列配置
const columns: PrimaryTableProps['columns'] = [
  {
    colKey: 'title',
    title: '资讯源名称',
    width: 200,
    ellipsis: true
  },
  {
    colKey: 'tag',
    title: '标签',
    width: 120,
    ellipsis: true
  },
  {
    colKey: 'website',
    title: '网站',
    width: 200,
    ellipsis: true
  },
  {
    colKey: 'type',
    title: '类型',
    width: 100,
    cell: (h, { row }) => {
      return h(Tag, {
        theme: row.type === 1 ? 'primary' : 'warning',
        variant: 'light'
      }, () => (row.type === 1 ? '热点' : '实时'))
    }
  },
  {
    colKey: 'is_enabled',
    title: '状态',
    width: 100,
    cell: (h, { row }) => {
      return h(Tag, {
        theme: row.is_enabled ? 'success' : 'default',
        variant: 'light'
      }, () => (row.is_enabled ? '启用' : '禁用'))
    }
  },
  {
    colKey: 'created_at',
    title: '创建时间',
    width: 180,
    cell: (h, { row }) => {
      return new Date(row.created_at * 1000).toLocaleString()
    }
  },
  {
    colKey: 'operation',
    title: '操作',
    width: 200,
    cell: (h, { row }) => {
      return [
        h(Button, {
          theme: 'primary',
          variant: 'text',
          size: 'small',
          onClick: () => handleEdit(row as SourceNews)
        }, () => '编辑'),
        h(Button, {
          theme: row.is_enabled ? 'warning' : 'success',
          variant: 'text',
          size: 'small',
          onClick: () => handleToggleStatus(row as SourceNews),
          style: { marginLeft: '8px' }
        }, () => (row.is_enabled ? '禁用' : '启用')),
        h(Button, {
          theme: 'danger',
          variant: 'text',
          size: 'small',
          onClick: () => handleDelete(row.id),
          style: { marginLeft: '8px' }
        }, () => '删除')
      ]
    }
  }
]


// 方法
const loadData = async () => {
  loading.value = true
  try {
    const response = await adminSourceNewsList()
    originalData.value = response || []
  } catch (error) {
    MessageUtil.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  // 客户端搜索，不需要重新加载数据
}

const handleReset = () => {
  searchForm.value = ''
  pagination.current = 1
}

const handleAdd = () => {
  openPostDialog(loadData);
}

const handleEdit = async (row: SourceNews) => {
  openPostDialog(loadData, row);
}


const handleDelete = (id: string) => {
  MessageBoxUtil.alert('确定要删除这个资讯源吗？删除后无法恢复。', '确认删除')
    .then(async () => {
      try {
        await adminSourceNewsDelete(id)
        MessageUtil.success('删除成功')
        loadData()
      } catch (error) {
        MessageUtil.error('删除失败')
      }
    })
}


const handleToggleStatus = async (row: SourceNews) => {
  try {
    await adminSourceNewsEnable(row.id)
    MessageUtil.success(row.is_enabled ? '禁用成功' : '启用成功')
    loadData()
  } catch (error) {
    MessageUtil.error('操作失败')
  }
}

const handlePageChange = (pageInfo: any) => {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  loadData()
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="less">
.news-source-page {
  padding: 24px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .page-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--td-text-color-primary);
    }
  }

  .search-card {
    margin-bottom: 16px;

    .search-form {
      margin-bottom: 0;
    }
  }

  .table-card {
    .batch-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid var(--td-border-level-1-color);
      margin-bottom: 16px;

      .selected-info {
        color: var(--td-text-color-secondary);
        font-size: 14px;
      }
    }
  }

  .dialog-content {
    display: flex;
    gap: 24px;
    height: 500px;

    .form-section {
      flex: 0 0 300px;
      padding-right: 24px;
      border-right: 1px solid var(--td-border-level-1-color);
    }

    .editor-section {
      flex: 1;
      display: flex;
      flex-direction: column;

      .editor-header {
        margin-bottom: 12px;

        .editor-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--td-text-color-primary);
        }
      }

      .editor-container {
        flex: 1;
        border: 1px solid var(--td-border-level-1-color);
        border-radius: 6px;
        overflow: hidden;
      }
    }
  }
}
</style>