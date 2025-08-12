<template>
  <div class="content-container">
    <!-- Pending状态：显示选择界面 -->
    <t-card v-if="contentId === 'pending'" class="pending-card">
      <template #header>
        <t-typography variant="h6">请选择操作</t-typography>
      </template>
      <div class="pending-actions">
        <t-space direction="vertical" size="large" align="center">
          <t-typography variant="body1" class="pending-description">
            您可以选择订阅内容或浏览现有文章
          </t-typography>
          <t-space size="medium">
            <t-button theme="primary" size="large" @click="handleSubscribe">
              <template #icon><t-icon name="add" /></template>
              订阅内容
            </t-button>
            <t-button variant="outline" size="large" @click="handleSelectArticle">
              <template #icon><t-icon name="browse" /></template>
              选择文章
            </t-button>
          </t-space>
        </t-space>
      </div>
    </t-card>

    <!-- 正常内容展示 -->
    <div v-else class="content-card">

      <!-- 加载状态 -->
      <t-loading v-if="loading" text="加载中..." size="large" class="w-full h-100vh" />

      <!-- 内容主体 -->
      <div v-else-if="contentData" class="content-body">

        <!-- 内容详情 -->
        <div class="content-detail">
          <h1 class="content-title">
            {{ contentData.title || '无标题' }}
          </h1>

          <t-space class="content-meta" size="large">
            <t-typography variant="body2" class="meta-item">
              <t-icon name="time" />
              发布时间: {{ formatDate(contentData.created_at) }}
            </t-typography>
            <t-typography variant="body2" class="meta-item">
              <t-icon name="check-circle" />
              状态:
              <t-tag :theme="contentData.read_status === 1 ? 'success' : 'warning'" variant="light">
                {{ contentData.read_status === 1 ? '已读' : '未读' }}
              </t-tag>
            </t-typography>
          </t-space>

          <!-- 内容文本 -->
          <div class="content-text" v-if="contentData.content.content">
            <t-typography variant="body1">
              <div v-html="contentData.content.content"></div>
            </t-typography>
          </div>
          <t-empty v-else description="暂无内容" />
        </div>
      </div>

      <!-- 错误状态 -->
      <t-empty v-else description="内容加载失败或不存在">
        <template #action>
          <t-button theme="primary" @click="loadContentData">重试</t-button>
        </template>
      </t-empty>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { pluginSubscribeContent } from '@/apis/plugin/subscribe';
import { SourceSubscribeRecordView } from '@/types/SourceSubscribe';

const route = useRoute();
const router = useRouter();
const viewId = ref(route.params.viewId);
const listId = ref(route.params.listId);
const contentId = ref(route.params.contentId);
const loading = ref(false);
const isReadLoading = ref(false);
const isRefreshLoading = ref(false);
const contentData = ref<SourceSubscribeRecordView | null>(null);

// Pending状态处理函数
const handleSubscribe = () => {
  MessagePlugin.info('跳转到订阅页面');
  // 这里可以根据实际需求跳转到订阅页面
  // router.push('/subscribe');
};

const handleSelectArticle = () => {
  MessagePlugin.info('跳转到文章选择页面');
  // 这里可以根据实际需求跳转到文章列表页面
  // router.push(`/subscribe/view/${viewId.value}/record/${listId.value}`);
};

// 格式化日期
const formatDate = (timestamp: number | string | undefined) => {
  if (!timestamp) return '未知时间';
  const date = new Date(Number(timestamp));
  return date.toLocaleString();
};

// 加载内容数据
const loadContentData = async () => {
  if (!contentId.value) return;
  if (contentId.value === 'pending') {
    // 空
    return;
  }

  loading.value = true;
  try {
    const result = await pluginSubscribeContent(contentId.value as string);
    contentData.value = result;
    console.log('内容加载成功:', contentData.value);
  } catch (error) {
    console.error('加载内容失败:', error);
    contentData.value = null;
  } finally {
    loading.value = false;
  }
};


// 监听路由参数变化
watch(() => route.params.contentId, (newId) => {
  contentId.value = newId;
  loadContentData();
});

onMounted(() => {
  // 初始化加载内容数据
  console.log('加载内容数据:', contentId.value);
  console.log('所属列表:', listId.value);
  console.log('所属视图:', viewId.value);
  loadContentData();
});
</script>

<style scoped lang="less">
.content-container {
  max-width: 1200px;
  margin: 0 auto;
}

// Pending状态样式
.pending-card {
  text-align: center;
  min-height: 300px;

  .pending-actions {
    padding: 32px 16px;
  }

  .pending-description {
    color: var(--td-text-color-secondary);
    margin-bottom: 24px;
  }
}

// 内容卡片样式
.content-card {
  padding: 24px;

  .content-body {
    .content-actions {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--td-border-level-1-color);
    }

    .content-detail {
      .content-title {
        margin-bottom: 16px;
        color: var(--td-text-color-primary);
        line-height: 2rem;
      }

      .content-meta {
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--td-border-level-1-color);

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--td-text-color-secondary);
        }
      }

      .content-text {
        line-height: 1.8;
        color: var(--td-text-color-primary);

        :deep(img) {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 8px 0;
        }

        :deep(p) {
          margin-bottom: 16px;
        }

        :deep(h1),
        :deep(h2),
        :deep(h3),
        :deep(h4),
        :deep(h5),
        :deep(h6) {
          margin: 24px 0 16px 0;
          color: var(--td-text-color-primary);
        }

        :deep(blockquote) {
          border-left: 4px solid var(--td-brand-color);
          padding-left: 16px;
          margin: 16px 0;
          background-color: var(--td-bg-color-container-hover);
          padding: 16px;
          border-radius: 4px;
        }

        :deep(code) {
          background-color: var(--td-bg-color-component);
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }

        :deep(pre) {
          background-color: var(--td-bg-color-component);
          padding: 16px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 16px 0;

          code {
            background: none;
            padding: 0;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .content-container {
    padding: 8px;
  }

  .pending-card {
    .pending-actions {
      padding: 24px 8px;
    }
  }

  .content-card {
    .content-body {
      .content-actions {
        :deep(.t-space) {
          flex-direction: column;
          align-items: stretch;
        }
      }

      .content-meta {
        :deep(.t-space) {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    }
  }
}
</style>
