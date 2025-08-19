<template>
  <div class="tools-list-container">
    <!-- 搜索栏 -->
    <div class="search-container">
      <t-input v-model="searchQuery" placeholder="搜索工具名称、描述..." clearable size="large" class="search-input">
        <template #prefix-icon>
          <SearchIcon />
        </template>
      </t-input>
    </div>

    <div class="list-container">
      <t-row :gutter="[8, 8]" v-if="!loading && filteredTools.length > 0">
        <t-col flex="400px" v-for="tool in filteredTools" :key="tool.id">
          <t-card hover shadow>
            <div class="card-content">
              <!-- 工具图标和标题 -->
              <div class="tool-header">
                <div class="tool-icon">
                  <t-avatar :image="tool.icon" shape="round" size="48px" v-if="tool.icon"/>
                  <ToolsIcon v-else/>
                </div>
                <div class="tool-info">
                  <t-link class="tool-name" theme="primary" @click="handlePreview(tool)">{{ tool.title }}</t-link>

                  <p class="tool-description">{{ tool.description || '暂无描述' }}</p>
                </div>
              </div>

              <t-space size="small">
                <t-tag v-for="tag in tool.tags" theme="primary">{{ tag }}</t-tag>
              </t-space>

              <!-- 操作按钮 -->
              <div class="tool-actions" @click.stop>
                <t-button size="small" variant="text" theme="primary" @click="handleEdit(tool)">
                  <template #icon>
                    <EditIcon />
                  </template>
                  编辑
                </t-button>
                <t-button size="small" variant="text" theme="danger" @click="handleDelete(tool)">
                  <template #icon>
                    <DeleteIcon />
                  </template>
                  删除
                </t-button>
              </div>
            </div>
          </t-card>
        </t-col>
      </t-row>
      <!-- 工具列表 -->

      <!-- 空状态 -->
      <div v-else-if="!loading && filteredTools.length === 0 && searchQuery" class="empty-state">
        <EmptyResult title="未找到相关工具" :description="`没有找到包含 '${searchQuery}' 的工具`" />
      </div>
      <div v-else-if="!loading && tools.length === 0" class="empty-state">
        <EmptyResult title="暂无工具" />
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <t-loading size="large" text="加载中..." />
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { EditIcon, DeleteIcon, ToolsIcon, SearchIcon } from 'tdesign-icons-vue-next';
import { useFuse } from '@vueuse/integrations/useFuse';
import { toolManageList, toolManageDelete } from '@/apis/tool/manage';
import type { AiTool } from '@/types/AiTool';
import MessageBoxUtil from '@/utils/modal/MessageBoxUtil';
import { useToolBreadcrumbStore } from '../breadcrumb';
import MessageUtil from '@/utils/modal/MessageUtil';

const router = useRouter();

// 响应式数据
const loading = ref(false);
const tools = ref<AiTool[]>([]);
const searchQuery = ref('');

// 配置 Fuse.js 搜索选项

// 使用 useFuse 进行模糊搜索
const { results } = useFuse(searchQuery, tools, {
  matchAllWhenSearchEmpty: true,
  fuseOptions: {
    keys: ['title', 'description', 'tags'],
    threshold: 0.3, // 模糊匹配阈值
    includeScore: true,
    includeMatches: true
  }
});

// 计算过滤后的工具列表
const filteredTools = computed(() => {
  if (!searchQuery.value.trim()) {
    return tools.value;
  }
  return results.value.map(result => result.item);
});

// 获取工具列表
const fetchTools = async () => {
  try {
    loading.value = true;
    const response = await toolManageList();
    tools.value = response || [];
  } catch (error) {
    console.error('获取工具列表失败:', error);
    MessageUtil.error('获取工具列表失败');
  } finally {
    loading.value = false;
  }
};

// 编辑工具
const handleEdit = (tool: AiTool) => {
  useToolBreadcrumbStore().setTitle('编辑');
  router.push(`/tools/post/${tool.id}`);
};

// 预览工具
const handlePreview = (tool: AiTool) => {
  useToolBreadcrumbStore().setTitle(tool.title);
  router.push(`/tools/item/${tool.id}`);
};

// 删除工具
const handleDelete = (tool: AiTool) => {
  MessageBoxUtil.confirm(`确定要删除工具 "${tool.title}" 吗？此操作不可撤销。`, '删除工具', {
    confirmButtonText: '删除'
  }).then(async () => {
    try {
      await toolManageDelete(tool.id);
      MessageUtil.success('删除成功');
      fetchTools();
    } catch (error) {
      console.error('删除工具失败:', error);
      MessageUtil.error('删除工具失败');
    }

  })
};


// 组件挂载时获取数据
onMounted(() => {
  useToolBreadcrumbStore().setTitle("列表");
  fetchTools();
});
</script>

<style scoped lang="less">
.tools-list-container {
  background-color: var(--td-bg-color-page);
  width: 100%;
  height: 100%;
  position: relative;
}

.search-container {
  display: flex;
  justify-content: center;
  padding: 16px 0;

  .search-input {
    max-width: 500px;
    width: 100%;
  }
}

.list-container {
  position: absolute;
  top: 72px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  overflow-y: auto;
  overflow-x: hidden;
}


.tool-card {
  cursor: pointer;
}

.tool-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;

  .tool-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--td-brand-color-light);
    border-radius: 8px;
    margin-right: 12px;
    flex-shrink: 0;

    :deep(.t-icon) {
      font-size: 24px;
      color: var(--td-brand-color);
    }
  }

  .tool-info {
    flex: 1;
    min-width: 0;

    .tool-name {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tool-description {
      margin: 0;
      font-size: 14px;
      color: var(--td-text-color-secondary);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
}


.tool-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--td-border-level-1-color);
  margin-top: 12px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>