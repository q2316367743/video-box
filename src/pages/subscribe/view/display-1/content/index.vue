<template>
  <div class="content-container">
    <!-- 顶部固定栏 -->
    <div class="top-bar" :class="{ 'show-title': showTopTitle }">
      <!-- 左上角标题 -->
      <div class="top-title" v-if="showTopTitle && contentData">
        {{ contentData.title || '无标题' }}
      </div>

      <!-- 右上角操作按钮 -->
      <div class="top-actions">
        <t-space size="small">
          <t-tooltip content="返回列表">
            <t-button theme="default" variant="outline" shape="circle" size="small" @click="handleBack">
              <template #icon><t-icon name="arrow-left" /></template>
            </t-button>
          </t-tooltip>
          <t-tooltip content="刷新">
            <t-button theme="default" variant="outline" shape="circle" size="small" @click="handleRefresh"
              :loading="isRefreshLoading">
              <template #icon><refresh-icon /></template>
            </t-button>
          </t-tooltip>
          <t-tooltip content="分享">
            <t-button theme="default" variant="outline" shape="circle" size="small" @click="handleShare">
              <template #icon><t-icon name="share" /></template>
            </t-button>
          </t-tooltip>
          <t-tooltip content="更多">
            <t-dropdown :options="moreOptions" @click="handleMoreAction">
              <t-button theme="default" variant="outline" shape="circle" size="small">
                <template #icon><t-icon name="more" /></template>
              </t-button>
            </t-dropdown>
          </t-tooltip>
        </t-space>
      </div>
    </div>

    <div class="scroll-container-wrap" @scroll="handleScroll">
      <!-- 滚动容器 -->
      <div class="scroll-container">
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
              <h1 class="content-title" @click="handleTitleClick" :class="{ 'clickable': contentData?.link }">
                {{ contentData.title || '无标题' }}
              </h1>

              <t-space class="content-meta" size="large">
                <t-tooltip content="作者">
                  <div v-if="contentData.subscribe.name" class="items-center flex gap-6px">
                    <t-avatar v-if="contentData.subscribe.icon" :image="contentData.subscribe.icon" size="small"
                      shape="round" />
                    <user-icon v-else />
                    <span style="color: var(--td-text-color-secondary);">{{ contentData.subscribe.name }}</span>
                  </div>
                </t-tooltip>
                <t-tooltip content="发布时间">
                  <t-tag theme="warning" variant="light-outline">
                    <template #icon>
                      <calendar-icon />
                    </template>
                    {{ prettyDate(contentData.pub_date) }}
                  </t-tag>
                </t-tooltip>
                <t-tooltip content="刷新时间">
                  <t-tag theme="primary" variant="light-outline">
                    <template #icon>
                      <refresh-icon />
                    </template>
                    {{ prettyDate(contentData.created_at) }}
                  </t-tag>
                </t-tooltip>
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
    </div>
    <t-back-top container=".scroll-container-wrap" />
  </div>
</template>

<script lang="ts" setup>
import { MessagePlugin } from 'tdesign-vue-next';
import { RefreshIcon, UserIcon, CalendarIcon } from "tdesign-icons-vue-next";
import { pluginSubscribeContent } from '@/apis/plugin/subscribe';
import { SourceSubscribeRecordView } from '@/types/SourceSubscribe';
import { showImagesPlugin } from '@/plugin/MediaPlugin.tsx';
import { prettyDate } from "@/utils/lang/FormatUtil.ts";

const route = useRoute();
const router = useRouter();
const viewId = ref(route.params.viewId);
const listId = ref(route.params.listId);
const contentId = ref(route.params.contentId);
const loading = ref(false);
const isReadLoading = ref(false);
const isRefreshLoading = ref(false);
const contentData = ref<SourceSubscribeRecordView | null>(null);
const showTopTitle = ref(false);

// 更多操作选项
const moreOptions = [
  { content: '复制链接', value: 'copy' },
  { content: '在新窗口打开', value: 'open' },
  { content: '标记为已读', value: 'read' },
  { content: '收藏', value: 'favorite' }
];

// 图片点击事件处理函数
const handleImageClick = (event: Event) => {
  const target = event.target as HTMLElement;

  // 检查点击的是否是图片
  if (target.tagName === 'IMG') {
    const contentTextElement = target.closest('.content-text');

    if (contentTextElement) {
      // 获取该元素内的所有图片
      const images = contentTextElement.querySelectorAll('img');
      const imageUrls: string[] = [];
      let clickedIndex = 0;

      images.forEach((img, index) => {
        const src = img.getAttribute('src');
        if (src) {
          imageUrls.push(src);
          if (img === target) {
            clickedIndex = index;
          }
        }
      });

      if (imageUrls.length > 0) {
        // 阻止默认行为
        event.preventDefault();
        event.stopPropagation();

        // 调用图片预览
        showImagesPlugin(imageUrls, clickedIndex, () => {
          console.log('图片预览已关闭');
        });
      }
    }
  }
};

// 标题点击处理函数
const handleTitleClick = () => {
  if (contentData.value?.link) {
    window.open(contentData.value.link, '_blank');
  } else {
    MessagePlugin.warning('该文章没有原文链接');
  }
};

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

// 顶部操作按钮处理函数
const handleBack = () => {
  router.push(`/subscribe/view/${viewId.value}/record/${listId.value}`);
};

const handleRefresh = async () => {
  isRefreshLoading.value = true;
  try {
    await loadContentData();
    MessagePlugin.success('刷新成功');
  } catch (error) {
    MessagePlugin.error('刷新失败');
  } finally {
    isRefreshLoading.value = false;
  }
};

const handleShare = () => {
  if (contentData.value?.link) {
    navigator.clipboard.writeText(contentData.value.link).then(() => {
      MessagePlugin.success('链接已复制到剪贴板');
    }).catch(() => {
      MessagePlugin.error('复制失败');
    });
  } else {
    MessagePlugin.warning('该文章没有可分享的链接');
  }
};

const handleMoreAction = (data: any) => {
  switch (data.value) {
    case 'copy':
      if (contentData.value?.link) {
        navigator.clipboard.writeText(contentData.value.link).then(() => {
          MessagePlugin.success('链接已复制');
        });
      } else {
        MessagePlugin.warning('该文章没有链接');
      }
      break;
    case 'open':
      if (contentData.value?.link) {
        window.open(contentData.value.link, '_blank');
      } else {
        MessagePlugin.warning('该文章没有原文链接');
      }
      break;
    case 'read':
      MessagePlugin.info('标记为已读');
      break;
    case 'favorite':
      MessagePlugin.info('收藏功能');
      break;
  }
};

// 监听滚动事件，控制顶部标题显示
const handleScroll = () => {
  const titleElement = document.querySelector('.content-title');
  if (titleElement) {
    const rect = titleElement.getBoundingClientRect();
    // 当标题完全滚动出视窗时显示顶部标题
    showTopTitle.value = rect.bottom < 60;
  }
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
  } catch (error) {
    console.error('加载内容失败:', error);
    contentData.value = null;
  } finally {
    loading.value = false;
    // 尝试返回顶部
    document.querySelector('.record-content')?.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    })
  }
};


// 监听路由参数变化
watch(() => route.params.contentId, (newId) => {
  contentId.value = newId;
  loadContentData();
});

onMounted(() => {
  // 初始化加载内容数据
  loadContentData();

  // 添加图片点击事件监听器
  document.addEventListener('click', handleImageClick, true);
});

onUnmounted(() => {
  // 移除图片点击事件监听器
  document.removeEventListener('click', handleImageClick, true);
});
</script>

<style scoped lang="less">
.content-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

// 顶部固定栏样式
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(216, 216, 216, 0.65);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--td-border-level-1-color);
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 100;
  transition: all 0.3s ease;
  transform: translateY(-100%);
  opacity: 0;

  &.show-title {
    transform: translateY(0);
    opacity: 1;
  }

  .top-title {
    flex: 1;
    font-size: 16px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 16px;
  }

  .top-actions {
    flex-shrink: 0;
  }
}


.scroll-container-wrap {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

// 滚动容器
.scroll-container {
  max-width: 1000px;
  margin: 0 auto;
}

// 暗色主题适配
[theme-mode="dark"] .top-bar {
  background: rgba(39, 39, 39, 0.65);
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
        margin-bottom: 20px;
        color: var(--td-text-color-primary);
        line-height: 2.2rem;
        font-size: 1.8rem;
        font-weight: 600;
        border-bottom: 2px solid var(--td-brand-color-light);
        padding-bottom: 12px;

        &.clickable {
          cursor: pointer;
          transition: color 0.2s ease;

          &:hover {
            color: var(--td-brand-color);
          }
        }
      }

      .content-meta {
        margin-bottom: 24px;
        border-radius: 6px;


        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--td-text-color-secondary);

          :deep(.t-icon) {
            color: var(--td-brand-color);
          }
        }
      }

      .content-text {
        line-height: 1.8;
        color: var(--td-text-color-primary);
        font-size: 16px;
        letter-spacing: 0.3px;

        :deep(img) {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px auto;
          display: block;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
          cursor: pointer;
        }

        :deep(p) {
          margin-bottom: 16px;
          line-height: 1.8;
        }

        :deep(h1),
        :deep(h2),
        :deep(h3),
        :deep(h4),
        :deep(h5),
        :deep(h6) {
          margin: 28px 0 16px 0;
          color: var(--td-text-color-primary);
          font-weight: 600;
        }

        :deep(a) {
          color: var(--td-brand-color);
          text-decoration: none;
          transition: color 0.2s ease;

          &:hover {
            color: var(--td-brand-color-hover);
          }
        }

        :deep(blockquote) {
          border-left: 4px solid var(--td-brand-color);
          padding: 16px 20px;
          margin: 20px 0;
          background-color: var(--td-bg-color-container-hover);
          border-radius: 4px;
          color: var(--td-text-color-secondary);
          font-style: italic;
        }

        :deep(code) {
          background-color: var(--td-bg-color-component);
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          color: var(--td-error-color-6);
        }

        :deep(pre) {
          background-color: var(--td-bg-color-component);
          padding: 16px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 16px 0;
          border: 1px solid var(--td-component-stroke);

          code {
            background: none;
            padding: 0;
            color: inherit;
            font-size: 0.95em;
            line-height: 1.5;
          }
        }

        :deep(ul),
        :deep(ol) {
          padding-left: 24px;
          margin: 16px 0;

          li {
            margin-bottom: 8px;
          }
        }

        :deep(table) {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;

          th,
          td {
            border: 1px solid var(--td-component-stroke);
            padding: 10px;
            text-align: left;
          }

          th {
            background-color: var(--td-bg-color-container-hover);
            font-weight: 600;
          }

          tr:nth-child(even) {
            background-color: var(--td-bg-color-container-hover);
          }
        }

        :deep(hr) {
          border: none;
          border-top: 1px solid var(--td-component-stroke);
          margin: 24px 0;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .content-container {
    padding: 12px;
  }

  .top-bar {
    padding: 0 16px;
    height: 56px;
    margin: 0 12px;
    width: calc(100% - 24px);

    .top-title {
      font-size: 14px;
    }

    .top-actions {
      :deep(.t-space) {
        gap: 4px;
      }
    }
  }

  .pending-card {
    .pending-actions {
      padding: 24px 8px;
    }
  }

  .content-card {
    padding: 16px;

    .content-body {
      .content-title {
        font-size: 1.5rem;
        line-height: 1.8rem;
      }

      .content-actions {
        :deep(.t-space) {
          flex-direction: column;
          align-items: stretch;
        }
      }

      .content-meta {
        padding: 10px;

        :deep(.t-space) {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
      }

      .content-text {
        font-size: 15px;

        :deep(img) {
          margin: 12px auto;
        }

        :deep(pre) {
          padding: 12px;
          font-size: 14px;
        }

        :deep(blockquote) {
          padding: 12px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .content-container {
    padding: 0 8px;
  }

  .top-bar {
    left: 8px;
    right: 8px;
    padding: 0 12px;
    height: 52px;

    .top-title {
      font-size: 13px;
    }
  }

  .content-card {
    padding: 12px;

    .content-body {
      .content-title {
        font-size: 1.3rem;
        line-height: 1.6rem;
      }

      .content-text {
        font-size: 14px;
      }
    }
  }
}
</style>
