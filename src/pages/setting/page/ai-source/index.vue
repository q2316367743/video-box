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
            <t-button size="small" variant="text" shape="square" @click="handleViewModels(row)">
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

    <!-- 新增/编辑对话框 -->
    <t-dialog :header="dialogTitle" :visible="dialogVisible" width="600px" placement="center" @close="handleDialogClose"
      @confirm="handleSubmit" :confirm-btn="{ loading: submitting, content: isEdit ? '更新' : '新增' }">
      <t-form :data="formData" :rules="formRules" ref="formRef" label-width="100px" @submit="handleSubmit">
        <t-form-item label="名称" name="name">
          <t-input v-model="formData.name" placeholder="请输入AI源名称" />
        </t-form-item>
        <t-form-item label="URL" name="url">
          <t-input v-model="formData.url" placeholder="请输入API URL" />
        </t-form-item>
        <t-form-item label="Token" name="token">
          <t-input v-model="formData.token" type="password" placeholder="请输入API Token" />
        </t-form-item>
        <t-form-item label="状态" name="is_enabled">
          <t-radio-group v-model="formData.is_enabled">
            <t-radio :value="1">启用</t-radio>
            <t-radio :value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="描述" name="description">
          <t-textarea v-model="formData.description" :autosize="{ minRows: 3, maxRows: 5 }" placeholder="请输入描述信息" />
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 模型列表对话框 -->
    <t-dialog header="AI模型列表" :visible="modelsDialogVisible" width="900px" placement="center"
      @close="handleModelsDialogClose" :footer="false">
      <div class="models-header">
        <span>{{ currentAiSource?.name }} 的可用模型 ({{ filteredModelsList.length }})</span>
        <t-space>
          <t-input v-model="modelSearchKeyword" placeholder="搜索模型..." clearable style="width: 200px">
            <template #prefix-icon>
              <search-icon />
            </template>
          </t-input>
          <t-button variant="outline" :loading="loadingModels" @click="handleRefreshCurrentModels">
            <template #icon>
              <refresh-icon />
            </template>
            刷新
          </t-button>
        </t-space>
      </div>
      <t-table :data="filteredModelsList" :loading="loadingModels" :columns="modelColumns" stripe hover max-height="500"
        :virtual-scroll="{ isFixedRowHeight: true, rowHeight: 48, bufferSize: 20 }">
        <template #created_at="{ row }">
          {{ formatTime(row.created_at) }}
        </template>
      </t-table>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  ViewListIcon,
  RefreshIcon,
  SearchIcon
} from 'tdesign-icons-vue-next'
import {
  adminSourceAiList,
  adminSourceAiAdd,
  adminSourceAiUpdate,
  adminSourceAiDel,
  adminSourceAModels,
  adminSourceAiRefresh
} from '@/apis/admin/source/ai'
import type { SourceAi, SourceAiCore, SourceAiModel } from '@/types/SourceAi'
import type { FormInstanceFunctions, FormRule, TableProps } from 'tdesign-vue-next'
import { toDateTimeString } from '@/utils/lang/FormatUtil'
import Fuse from 'fuse.js'

// 响应式数据
const loading = ref(false)
const aiSourceList = ref<SourceAi[]>([])
const dialogVisible = ref(false)
const modelsDialogVisible = ref(false)
const submitting = ref(false)
const loadingModels = ref(false)
const refreshingIds = ref<string[]>([])
const isEdit = ref(false)
const currentEditId = ref('')
const currentAiSource = ref<SourceAi | null>(null)
const modelsList = ref<SourceAiModel[]>([])
const modelSearchKeyword = ref('')
const fuse = ref<Fuse<SourceAiModel> | null>(null)

// 表单数据
const formRef = ref<FormInstanceFunctions>()
const formData = reactive<SourceAiCore>({
  name: '',
  description: '',
  url: '',
  token: '',
  is_enabled: 1
})

// 表单验证规则
const formRules: Record<string, FormRule[]> = {
  name: [
    { required: true, message: '请输入AI源名称', trigger: 'blur' },
    { min: 2, max: 50, message: '名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  url: [
    { required: true, message: '请输入URL', trigger: 'blur' },
    { url: true, message: '请输入有效的URL地址', trigger: 'blur' }
  ],
  token: [
    { required: true, message: '请输入Token', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入描述', trigger: 'blur' }
  ],
  is_enabled: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 表格列配置
const columns: TableProps['columns'] = [
  { colKey: 'name', title: '名称', width: 120 },
  { colKey: 'url', title: 'URL', width: 200, ellipsis: true },
  { colKey: 'token', title: 'Token', width: 150, ellipsis: true },
  { colKey: 'description', title: '描述', width: 150, ellipsis: true },
  { colKey: 'is_enabled', title: '状态', width: 80 },
  { colKey: 'created_at', title: '创建时间', width: 160 },
  { colKey: 'operation', title: '操作', width: 144, fixed: 'right' }
]

// 模型表格列配置
const modelColumns: TableProps['columns'] = [
  { colKey: 'model', title: '模型', width: 300, ellipsis: true },
  { colKey: 'owned', title: '所属', width: 200, ellipsis: true },
  { colKey: 'created_at', title: '创建时间', width: 160 }
]

// 计算属性
const dialogTitle = computed(() => isEdit.value ? '编辑AI源' : '新增AI源')

// 过滤后的模型列表 - 使用 Fuse.js 进行模糊搜索
const filteredModelsList = computed(() => {
  if (!modelSearchKeyword.value.trim()) {
    return modelsList.value
  }

  if (!fuse.value) {
    // 如果 Fuse.js 未初始化，使用简单的字符串匹配
    return modelsList.value.filter(model =>
      model.model?.toLowerCase().includes(modelSearchKeyword.value.toLowerCase()) ||
      model.owned?.toLowerCase().includes(modelSearchKeyword.value.toLowerCase())
    )
  }

  // 使用 Fuse.js 进行模糊搜索
  const results = fuse.value.search(modelSearchKeyword.value)
  return results.map(result => result.item)
})

// 监听模型列表变化，重新初始化 Fuse.js
watch(modelsList, (newList) => {
  if (newList.length > 0) {
    fuse.value = new Fuse(newList, {
      keys: [
        { name: 'model', weight: 0.7 },
        { name: 'owned', weight: 0.3 }
      ],
      threshold: 0.4, // 调整匹配阈值，0.4 提供较好的平衡
      includeScore: true,
      minMatchCharLength: 1,
      ignoreLocation: true, // 忽略匹配位置
      findAllMatches: true // 查找所有匹配项
    })
  } else {
    fuse.value = null
  }
}, { immediate: true })

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
  isEdit.value = false
  dialogVisible.value = true
}

const handleEdit = (row: SourceAi) => {
  isEdit.value = true
  currentEditId.value = row.id
  Object.assign(formData, {
    name: row.name,
    description: row.description,
    url: row.url,
    token: row.token,
    is_enabled: row.is_enabled
  })
  dialogVisible.value = true
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

const handleViewModels = async (row: SourceAi) => {
  currentAiSource.value = row
  modelsDialogVisible.value = true
  await loadModels(row.id)
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

const handleRefreshCurrentModels = async () => {
  if (currentAiSource.value) {
    await handleRefreshModels(currentAiSource.value)
    await loadModels(currentAiSource.value.id)
  }
}

const handleModelsDialogClose = () => {
  modelsDialogVisible.value = false
  modelSearchKeyword.value = ''
  modelsList.value = []
  fuse.value = null
  currentAiSource.value = null
}

const loadModels = async (aiSourceId: string) => {
  try {
    loadingModels.value = true
    const response = await adminSourceAModels(aiSourceId)
    modelsList.value = response || []
  } catch (error) {
    MessagePlugin.error('加载模型列表失败')
    console.error('Load models error:', error)
    modelsList.value = []
  } finally {
    loadingModels.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  const validateResult = await formRef.value.validate()
  if (validateResult !== true) return

  try {
    submitting.value = true

    if (isEdit.value) {
      await adminSourceAiUpdate(currentEditId.value, formData)
      MessagePlugin.success('更新成功')
    } else {
      await adminSourceAiAdd(formData)
      MessagePlugin.success('新增成功')
    }

    dialogVisible.value = false
    await loadAiSourceList()
  } catch (error: any) {
    if (error.message) {
      MessagePlugin.error(error.message)
    } else {
      MessagePlugin.error(isEdit.value ? '更新失败' : '新增失败')
    }
    console.error('Submit error:', error)
  } finally {
    submitting.value = false
  }
}

const handleDialogClose = () => {
  dialogVisible.value = false
  resetForm()
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.reset()
  }
  Object.assign(formData, {
    name: '',
    description: '',
    url: '',
    token: '',
    is_enabled: 1
  })
  currentEditId.value = ''
}

const maskToken = (token: string) => {
  if (!token || token.length <= 8) return token
  return token.substring(0, 4) + '****' + token.substring(token.length - 4)
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

  .models-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-weight: 500;
    color: var(--td-text-color-primary);
  }

  .text-placeholder {
    color: var(--td-text-color-placeholder);
  }
}
</style>