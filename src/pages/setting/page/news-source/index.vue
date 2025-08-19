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
      <t-form ref="searchForm" :data="searchForm" layout="inline" class="search-form">
        <t-form-item label="资讯源名称" name="title">
          <t-input v-model="searchForm.title" placeholder="请输入资讯源名称" clearable style="width: 200px" />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
            <t-option value="" label="全部" />
            <t-option value="1" label="启用" />
            <t-option value="0" label="禁用" />
          </t-select>
        </t-form-item>
        <t-form-item>
          <t-button theme="primary" @click="handleSearch">
            <template #icon>
              <SearchIcon />
            </template>
            搜索
          </t-button>
          <t-button variant="outline" @click="handleReset" style="margin-left: 8px">
            重置
          </t-button>
        </t-form-item>
      </t-form>
    </t-card>

    <!-- 数据表格区域 -->
    <t-card class="table-card">

      <!-- 表格 -->
      <t-table ref="tableRef" :data="tableData" :columns="columns" :loading="loading" row-key="id" select-on-row-click
        @page-change="handlePageChange" :pagination="pagination" />
    </t-card>

    <!-- 新增/编辑弹窗 -->
    <t-dialog v-model:visible="dialogVisible" :header="dialogTitle" width="1200px" :confirm-btn="null"
      placement="center" :cancel-btn="null" destroy-on-close>
      <div class="dialog-content">
        <div class="form-section">
          <t-form ref="formRef" :data="formData" :rules="formRules" label-width="100px" @submit="handleSubmit">
            <t-form-item label="资讯源名称" name="title">
              <t-input v-model="formData.title" placeholder="请输入资讯源名称" />
            </t-form-item>
            <t-form-item label="Logo" name="logo">
              <ImageUpload v-model="formData.logo" />
            </t-form-item>
            <t-form-item label="标签" name="tag">
              <t-input v-model="formData.tag" placeholder="请输入标签" />
            </t-form-item>
            <t-form-item label="主题色" name="primary_color">
              <t-color-picker v-model="formData.primary_color" format="HEX" />
            </t-form-item>
            <t-form-item label="网站地址" name="website">
              <t-input v-model="formData.website" placeholder="请输入网站地址" />
            </t-form-item>
            <t-form-item label="类型" name="type">
              <t-select v-model="formData.type" placeholder="请选择类型">
                <t-option :value="1" label="热点" />
                <t-option :value="2" label="实时" />
              </t-select>
            </t-form-item>
            <t-form-item label="排序" name="order" help="越小越靠前">
              <t-input-number v-model="formData.order" placeholder="请输入排序值" />
            </t-form-item>
            <t-form-item label="状态" name="is_enabled">
              <t-switch v-model="formData.is_enabled" />
            </t-form-item>
          </t-form>
        </div>

        <div class="editor-section">
          <div class="editor-header">
            <span class="editor-title">JavaScript 脚本</span>
          </div>
          <div class="editor-container">
            <MonacoEditor v-model="formData.script" language="javascript" :height="466" :options="editorOptions" />
          </div>
        </div>
      </div>

      <template #footer>
        <t-button variant="outline" @click="dialogVisible = false">取消</t-button>
        <t-button theme="primary" @click="handleSubmit" :loading="submitLoading">
          保存
        </t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { MessagePlugin, DialogPlugin, type FormInstanceFunctions, type PageInfo, type TableProps, type FormRule, PrimaryTableProps, Button, Tag } from 'tdesign-vue-next'
import { AddIcon, SearchIcon, DeleteIcon, EditIcon } from 'tdesign-icons-vue-next'
import { useFuse } from '@vueuse/integrations/useFuse'
import MonacoEditor from '@/components/MonacoEditor.vue'
import {
  adminSourceNewsList,
  adminSourceNewsAdd,
  adminSourceNewsUpdate,
  adminSourceNewsDelete,
  adminSourceNewsEnable,
  adminSourceNewsInfo
} from '@/apis/admin/source/news'
import type { SourceNews, SourceNewsPost, SourceNewsType } from '@/types/SourceNews'

// 定义搜索表单类型
interface SearchForm {
  title: string
  status: string
}

// 定义API响应类型
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const originalData = ref<SourceNews[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref('');
const formRef = ref<FormInstanceFunctions>()

// 搜索表单
const searchForm = reactive({
  title: '',
  status: ''
})

// 使用 useFuse 进行模糊搜索
const { results } = useFuse(searchForm.title, originalData, {
  fuseOptions: {
    keys: ['title', 'tag'],
    threshold: 0.3
  },
  matchAllWhenSearchEmpty: true
})

// 计算过滤后的数据
const tableData = computed(() => {
  let filteredData = results.value.map(result => result.item)
  
  // 状态过滤
  if (searchForm.status !== '') {
    const statusValue = searchForm.status === '1' ? 1 : 0
    filteredData = filteredData.filter(item => item.is_enabled === statusValue)
  }
  
  return filteredData
})

// 表单数据
const formData = reactive<SourceNewsPost>({
  is_enabled: true,
  logo: '',
  title: '',
  tag: '',
  primary_color: '#1890ff',
  website: '',
  type: 1 as SourceNewsType,
  order: 0,
  script: ''
})

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
      }, row.type === 1 ? '热点' : '实时')
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
      }, row.is_enabled ? '启用' : '禁用')
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
        }, '编辑'),
        h(Button, {
          theme: row.is_enabled ? 'warning' : 'success',
          variant: 'text',
          size: 'small',
          onClick: () => handleToggleStatus(row as SourceNews),
          style: { marginLeft: '8px' }
        }, row.is_enabled ? '禁用' : '启用'),
        h(Button, {
          theme: 'danger',
          variant: 'text',
          size: 'small',
          onClick: () => handleDelete(row.id),
          style: { marginLeft: '8px' }
        }, '删除')
      ]
    }
  }
]

// 表单验证规则
const formRules: Record<string, FormRule[]> = {
  title: [
    { required: true, message: '请输入资讯源名称', type: 'error' as const }
  ],
  website: [
    { required: true, message: '请输入网站地址', type: 'error' as const }
  ],
  script: [
    { required: true, message: '请输入JavaScript脚本', type: 'error' as const }
  ]
}

// Monaco Editor 配置
const editorOptions = {
  theme: 'vs-dark',
  fontSize: 14,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true
}

// 计算属性
const dialogTitle = computed(() => isEdit.value ? '编辑资讯源' : '新增资讯源')

// 方法
const loadData = async () => {
  loading.value = true
  try {
    const response = await adminSourceNewsList()
    originalData.value = response || []
  } catch (error) {
    MessagePlugin.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  // 客户端搜索，不需要重新加载数据
}

const handleReset = () => {
  searchForm.title = ''
  searchForm.status = ''
  pagination.current = 1
}

const handleAdd = () => {
  isEdit.value = false
  editId.value = ''
  Object.assign(formData, {
    is_enabled: true,
    logo: '',
    title: '',
    tag: '',
    primary_color: '#1890ff',
    website: '',
    type: 1 as SourceNewsType,
    order: 0,
    script: ''
  })
  dialogVisible.value = true
}

const handleEdit = async (row: SourceNews) => {
  isEdit.value = true
  editId.value = row.id

  // 先显示基本信息
  Object.assign(formData, {
    is_enabled: row.is_enabled === 1,
    logo: row.logo,
    title: row.title,
    tag: row.tag,
    primary_color: row.primary_color,
    website: row.website,
    type: row.type,
    order: row.order,
    script: '' // 初始为空，等待API返回
  })

  dialogVisible.value = true

  // 异步获取完整信息，包括script字段
  try {
    const response = await adminSourceNewsInfo(row.id)
    if (response && response.script) {
      formData.script = response.script
    }
  } catch (error) {
    MessagePlugin.error('获取资讯源详情失败')
    console.error('获取资讯源详情失败:', error)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  const result = await formRef.value.validate()
  if (result !== true) return

  submitLoading.value = true
  try {
    if (isEdit.value) {
      await adminSourceNewsUpdate(editId.value, formData)
      MessagePlugin.success('更新成功')
    } else {
      await adminSourceNewsAdd(formData)
      MessagePlugin.success('添加成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    MessagePlugin.error(isEdit.value ? '更新失败' : '添加失败')
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = (id: string) => {
  DialogPlugin.confirm({
    header: '确认删除',
    body: '确定要删除这个资讯源吗？删除后无法恢复。',
    onConfirm: async () => {
      try {
        await adminSourceNewsDelete(id)
        MessagePlugin.success('删除成功')
        loadData()
      } catch (error) {
        MessagePlugin.error('删除失败')
      }
    }
  })
}


const handleToggleStatus = async (row: SourceNews) => {
  try {
    await adminSourceNewsEnable(row.id)
    MessagePlugin.success(row.is_enabled ? '禁用成功' : '启用成功')
    loadData()
  } catch (error) {
    MessagePlugin.error('操作失败')
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