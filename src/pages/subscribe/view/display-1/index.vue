<template>
  <div class="record-layout">
    <!-- 左侧边栏 -->
    <div width="324px" class="record-sidebar">
      <div class="sidebar-header">
        <div class="header-top flex justify-between items-center">
          <h3>订阅记录</h3>
          <t-button size="small" variant="outline" :loading="loading" @click="refreshData" class="refresh-btn">
            <template #icon>
              <RefreshIcon />
            </template>
            刷新
          </t-button>
        </div>
        <div class="header-bottom">
          <span class="total-count">共 {{ total }} 条记录</span>
        </div>
      </div>

      <div class="sidebar-content">
        <!-- 分页信息 -->
        <div class="sidebar-pagination">
          <div class="pagination-controls">
            <t-button size="small" variant="text" @click="prevPage" :disabled="currentPage <= 1">
              上一页
            </t-button>
            <span class="page-info">{{ currentPage }}/{{ totalPages }}</span>
            <t-button size="small" variant="text" @click="nextPage" :disabled="currentPage >= totalPages">
              下一页
            </t-button>
          </div>
        </div>

        <!-- 记录菜单 - 使用原生div -->
        <div class="record-menu">
          <t-loading :loading="loading">
            <div v-for="record in records" :key="record.id" class="record-menu-item"
              :class="{ 'active': selectedRecordId === record.id }" @click="handleItemClick(record.id)">
              <div class="item-header">
                <div class="item-title">{{ record.title || '无标题' }}</div>
                <div class="item-publisher" v-if="record.subscribe">
                  <t-avatar size="16px" :image="record.subscribe.icon" v-if="record.subscribe.icon">
                    {{ record.subscribe.name?.charAt(0) || 'S' }}
                  </t-avatar>
                  <t-avatar size="16px" v-else>
                    {{ record.subscribe.name?.charAt(0) || 'S' }}
                  </t-avatar>
                  <span class="publisher-name">{{ record.subscribe.name || '未知发布者' }}</span>
                </div>
              </div>
              <div class="item-description" v-if="record.description">
                {{ getPlainText(record.description) }}
              </div>
              <div class="item-meta">
                <span class="item-time">{{ prettyDate(record.pub_date) }}</span>
                <t-tag size="small" :variant="record.read_status === 1 ? 'light' : 'dark'"
                  :theme="record.read_status === 1 ? 'success' : 'primary'">
                  {{ record.read_status === 1 ? '已读' : '未读' }}
                </t-tag>
              </div>
            </div>
          </t-loading>
        </div>

        <div v-if="records.length === 0" class="no-records">
          <t-empty description="暂无记录" />
        </div>
      </div>
    </div>

    <!-- 右侧主内容区域 -->
    <div class="record-content">
      <router-view></router-view>
    </div>
    <t-back-top container=".record-content" />
  </div>
</template>

<script lang="ts" setup>
import { PluginSubscribeRecord, pluginSubscribeRead, pluginSubscribeRefresh } from '@/apis/plugin/subscribe';
import { SourceSubscribeRecordListView } from '@/types/SourceSubscribe';
import { prettyDate } from '@/utils/lang/FormatUtil';
import { RefreshIcon } from 'tdesign-icons-vue-next';

const route = useRoute();
const router = useRouter();

const listId = ref(route.params.listId as string);
const loading = ref(false);
const records = ref<SourceSubscribeRecordListView[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const selectedRecordId = ref<string>(route.params.contentId as string);

const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value) || 1;
});

// 加载记录数据
const loadRecords = async () => {
  console.log(listId.value)
  if (!listId.value) return;

  loading.value = true;
  try {
    const result = await PluginSubscribeRecord(
      '1',
      listId.value,
      currentPage.value,
      pageSize.value
    );

    if (result) {
      records.value = result.records || [];
      total.value = result.total || 0;

      // 如果当前路由包含recordId，设置为选中状态
      const currentRecordId = route.params.recordId as string;
      if (currentRecordId && records.value.some(r => r.id === currentRecordId)) {
        selectedRecordId.value = currentRecordId;
      }
    }
  } catch (error) {
    console.error('加载记录失败:', error);
  } finally {
    loading.value = false;
  }
};

// 处理菜单项点击
const handleItemClick = async (recordId: string) => {
  selectedRecordId.value = recordId;

  // 异步调用已读接口
  try {
    await pluginSubscribeRead(recordId);

    // 更新本地记录状态为已读
    const recordIndex = records.value.findIndex(r => r.id === recordId);
    if (recordIndex !== -1) {
      records.value[recordIndex].read_status = 1;
    }

  } catch (error) {
    console.error('标记已读失败:', error);
  }

  // 导航到内容页面
  navigateToContent(recordId);
};

// 去除HTML标签，只保留纯文本
const getPlainText = (html: string): string => {
  if (!html) return '';
  // 创建临时DOM元素来解析HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

// 翻页功能
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    loadRecords();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    loadRecords();
  }
};

// 监听路由参数变化
watch(() => route.params.listId, (newId) => {
  listId.value = newId as string;
  currentPage.value = 1; // 重置页码
  loadRecords();
});

// 监听recordId变化，同步选中状态
watch(() => route.params.recordId, (newRecordId) => {
  if (newRecordId && typeof newRecordId === 'string') {
    selectedRecordId.value = newRecordId;
  }
});
watch(() => route.params.contentId, (newValue) => {
  selectedRecordId.value = newValue as string;
});

onMounted(() => {
  // 初始化加载列表数据
  loadRecords();
});

const navigateToContent = (recordId: string) => {
  router.push({
    path: `/subscribe/view-1/list-${listId.value}/${recordId}`
  })
}

// 刷新数据
const refreshData = async () => {

  loading.value = true;
  try {
    await pluginSubscribeRefresh(listId.value);
  } finally {
    loading.value = false;
  }
  await loadRecords();
}
</script>

<style scoped lang="less">
.record-layout {
  height: 100%;
  overflow: auto;
  display: flex;

  .record-sidebar {
    background-color: var(--td-bg-color-component);
    border-right: 1px solid var(--td-border-level-1-color);
    display: flex;
    flex-direction: column;
    width: 324px;
    min-width: 324px;

    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid var(--td-border-level-1-color);

      h3 {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--td-text-color-primary);
      }

      .sidebar-subtitle {
        margin: 0;
        font-size: 12px;
        color: var(--td-text-color-secondary);
      }
    }

    .sidebar-loading {
      padding: 20px;
      text-align: center;
    }

    .sidebar-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .sidebar-pagination {
        padding: 12px 16px;
        border-bottom: 1px solid var(--td-border-level-1-color);

        .total-count {
          font-size: 12px;
          color: var(--td-text-color-secondary);
          display: block;
          margin-bottom: 8px;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .page-info {
            font-size: 12px;
            color: var(--td-text-color-secondary);
          }
        }
      }

      .record-menu {
        flex: 1;
        overflow-y: auto;

        .record-menu-item {
          position: relative;
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid var(--td-border-level-1-color);
          transition: all 0.2s ease;
          border-right: 3px solid transparent;

          &:hover {
            background-color: var(--td-bg-color-container-hover);
          }

          &.active {
            background-color: var(--td-brand-color-light);
            border-right: 3px solid var(--td-brand-color);

            .item-title {
              color: var(--td-brand-color);
            }
          }

          .item-header {
            margin-bottom: 8px;
          }

          .item-title {
            font-size: 14px;
            color: var(--td-text-color-primary);
            margin-bottom: 6px;
            line-height: 1.5;
            word-wrap: break-word;
            word-break: break-all;
            white-space: normal;
            font-weight: 500;
          }

          .item-publisher {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 2px;

            .publisher-name {
              font-size: 12px;
              color: var(--td-text-color-secondary);
              font-weight: 400;
            }
          }

          .item-description {
            font-size: 12px;
            color: var(--td-text-color-secondary);
            line-height: 1.4;
            margin-bottom: 8px;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            word-wrap: break-word;
            word-break: break-all;
          }

          .item-meta {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .item-time {
              font-size: 12px;
              color: var(--td-text-color-placeholder);
            }
          }
        }
      }

      .no-records {
        padding: 40px 16px;
        text-align: center;
      }
    }
  }

  .record-content {
    background-color: var(--td-bg-color-container);
    padding: 8px;
    overflow-y: auto;
    flex: auto;

    // 如果没有选中任何记录，显示提示信息
    &:empty::before {
      content: "请从左侧选择一条记录查看详情";
      display: block;
      text-align: center;
      color: var(--td-text-color-placeholder);
      padding: 60px 20px;
      font-size: 14px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .record-layout {
    .record-sidebar {
      width: 200px !important;
    }
  }
}

@media (max-width: 480px) {
  .record-layout {
    flex-direction: column;

    .record-sidebar {
      width: 100% !important;
      height: 40vh;
    }

    .record-content {
      height: 60vh;
    }
  }
}
</style>
