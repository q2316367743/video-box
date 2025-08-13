<template>
  <div class="weibo-layout">
    <div class="weibo-container">
      <!-- 微博卡片 -->
      <div v-for="record in records" :key="record.id" class="weibo-card" :data-record-id="record.id">
        <!-- 用户信息区域 -->
        <div class="user-info">
          <div class="avatar">
            <img :src="record.subscribe?.icon || '/default-avatar.png'" :alt="record.subscribe?.name || '用户'" />
          </div>
          <div class="user-details">
            <div class="username">{{ record.subscribe?.name || '匿名用户' }}</div>
            <div class="post-time">{{ prettyDate(record.pub_date) }}</div>
          </div>
          <div class="more-actions">
            <t-dropdown>
              <t-button variant="text" size="small">
                <template #icon>
                  <MoreIcon />
                </template>
              </t-button>
              <t-dropdown-menu>
                <t-dropdown-item>分享</t-dropdown-item>
                <t-dropdown-item>收藏</t-dropdown-item>
                <t-dropdown-item>举报</t-dropdown-item>
              </t-dropdown-menu>
            </t-dropdown>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="post-content">
          <!-- 文本内容 -->
          <div class="post-text" v-if="record.description">
            <div :class="['text-content', { 'expanded': expandedPosts[record.id] }]" v-html="record.description"
              ref="textContentRef"></div>
            <div v-if="shouldShowExpandButton(record.id)" class="expand-button" @click="toggleExpand(record.id)">
              {{ expandedPosts[record.id] ? '收起' : '展开' }}
            </div>
          </div>

          <!-- 媒体网格 -->
          <div v-if="record.medias && record.medias.length > 0" class="media-grid"
            :class="`grid-${getGridClass(record.medias.length)}`">
            <div v-for="(media, index) in record.medias.slice(0, 9)" :key="index" class="media-item"
              @click="showMediaPlugin(record.medias, index)">
              <img v-if="media.type === 1" :src="media.url" :alt="`图片 ${index + 1}`" class="media-image" />
              <div v-else-if="media.type === 2" class="media-video">
                <video :src="media.url" :poster="media.alt" preload="metadata"></video>
                <div class="play-button">
                  <PlayIcon />
                </div>
              </div>
              <!-- 如果超过9张，显示更多提示 -->
              <div v-if="index === 8 && record.medias.length > 9" class="more-media-overlay">
                +{{ record.medias.length - 9 }}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- 媒体查看器 -->
    <t-image-viewer v-model:visible="mediaViewerVisible" :images="currentMedias" :index="currentMediaIndex" />

    <t-back-top container=".weibo-container" />
  </div>
</template>

<script lang="ts" setup>
import { PluginSubscribeRecord } from '@/apis/plugin/subscribe';
import { SourceSubscribeRecordListView } from '@/types/SourceSubscribe';
import { prettyDate } from '@/utils/lang/FormatUtil';
import {
  MoreIcon,
  PlayIcon
} from 'tdesign-icons-vue-next';
import { showImagesPlugin, showMediaPlugin } from "@/plugin/MediaPlugin.tsx";

const route = useRoute();
const router = useRouter();

const listId = ref(route.params.listId as string);
const loading = ref(false);
const records = ref<Array<SourceSubscribeRecordListView>>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const selectedRecordId = ref<string>(route.params.contentId as string);

// 媒体查看器相关
const mediaViewerVisible = ref(false);
const currentMedias = ref<string[]>([]);
const currentMediaIndex = ref(0);

// 文本展开相关
const expandedPosts = ref<Record<string, boolean>>({});
const needsExpandButton = ref<Set<string>>(new Set());
const maxHeight = 120; // 最大高度，超过此高度显示展开按钮

// 加载记录数据
const loadRecords = async () => {
  if (!listId.value) return;

  loading.value = true;
  try {
    const result = await PluginSubscribeRecord(
      '2',
      listId.value,
      currentPage.value,
      pageSize.value
    );

    if (result) {
      records.value = result.records || [];
      total.value = result.total || 0;
      // 检查文本高度
      checkTextHeight();
    }
  } catch (error) {
    console.error('加载记录失败:', error);
  } finally {
    loading.value = false;
  }
};

// 根据媒体数量确定网格布局类型
const getGridClass = (count: number): string => {
  if (count === 1) return '1';
  if (count === 2) return '2';
  if (count === 3) return '3';
  if (count === 4) return '4';
  if (count <= 6) return '6';
  return '9';
};

// 打开媒体查看器
const openMediaViewer = (medias: any[], index: number) => {
  currentMedias.value = medias
    .filter(media => media.type === 'image')
    .map(media => media.url);
  currentMediaIndex.value = index;
  mediaViewerVisible.value = true;
};

// 去除HTML标签，只保留纯文本
const getPlainText = (html: string): string => {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

// 切换文本展开状态
const toggleExpand = (recordId: string) => {
  expandedPosts.value[recordId] = !expandedPosts.value[recordId];
};

// 判断是否需要显示展开按钮
const shouldShowExpandButton = (recordId: string) => {
  const textElement = document.querySelector(`[data-record-id="${recordId}"] .text-content`);
  if (textElement) {
    return textElement.scrollHeight > maxHeight;
  }
  return false;
};

// 检查文本高度并初始化展开状态
const checkTextHeight = () => {
  nextTick(() => {
    records.value.forEach(record => {
      const textElement = document.querySelector(`[data-record-id="${record.id}"] .text-content`);
      if (textElement && textElement.scrollHeight > maxHeight) {
        needsExpandButton.value.add(record.id);
        if (!(record.id in expandedPosts.value)) {
          expandedPosts.value[record.id] = false;
        }
      } else {
        needsExpandButton.value.delete(record.id);
      }
    });
  });
};

// 监听路由参数变化
watch(() => route.params.listId, (newId) => {
  listId.value = newId as string;
  currentPage.value = 1;
  loadRecords();
});

// 监听recordId变化，同步选中状态
watch(() => route.params.recordId, (newRecordId) => {
  if (newRecordId && typeof newRecordId === 'string') {
    selectedRecordId.value = newRecordId;
  }
});

onMounted(() => {
  loadRecords();
});

const navigateToContent = (recordId: string) => {
  router.push({
    path: `/subscribe/view-1/list-${listId.value}/${recordId}`
  });
};
</script>

<style scoped lang="less">
.weibo-layout {
  min-height: 100vh;
  background-color: #f7f9fa;

  .weibo-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px 16px;
    overflow-y: auto;
  }
}

.weibo-card {
  background: #ffffff;
  border-radius: 12px;
  margin-bottom: 16px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.user-info {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 12px;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .user-details {
    flex: 1;
    min-width: 0;

    .username {
      font-weight: 700;
      font-size: 15px;
      color: #0f1419;
      line-height: 20px;
    }

    .user-handle {
      font-size: 13px;
      color: #536471;
      line-height: 16px;
    }

    .post-time {
      font-size: 13px;
      color: #536471;
      margin-top: 2px;
    }
  }

  .more-actions {
    margin-left: auto;
  }
}

.post-content {
  .post-text {
    font-size: 15px;
    line-height: 20px;
    color: #0f1419;
    margin-bottom: 12px;
    word-wrap: break-word;
    position: relative;

    .text-content {
      max-height: 120px;
      overflow: hidden;
      transition: max-height 0.3s ease;
      position: relative;

      &:not(.expanded)::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 40px;
        background: linear-gradient(transparent, rgba(255, 255, 255, 0.9) 50%, #ffffff);
        pointer-events: none;
      }

      &.expanded {
        max-height: none;

        &::after {
          display: none;
        }
      }
    }

    .expand-button {
      color: #1d9bf0;
      cursor: pointer;
      font-size: 14px;
      margin-top: 8px;
      user-select: none;

      &:hover {
        text-decoration: underline;
      }
    }

    :deep(p) {
      margin: 0 0 12px 0;

      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(a) {
      color: #1d9bf0;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.media-grid {
  border-radius: 12px;
  overflow: hidden;
  display: grid;
  gap: 2px;

  &.grid-1 {
    grid-template-columns: 1fr;
    max-height: 500px;
  }

  &.grid-2 {
    grid-template-columns: 1fr 1fr;
  }

  &.grid-3 {
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 1fr 1fr;

    .media-item:first-child {
      grid-row: 1 / 3;
    }
  }

  &.grid-4 {
    grid-template-columns: 1fr 1fr;
  }

  &.grid-6 {
    grid-template-columns: 1fr 1fr 1fr;
  }

  &.grid-9 {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
  }

  .media-item {
    position: relative;
    background: #f7f9fa;
    cursor: pointer;
    overflow: hidden;
    aspect-ratio: 1;

    &:hover {
      opacity: 0.9;
    }

    .media-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .media-video {
      position: relative;
      width: 100%;
      height: 100%;

      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .play-button {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 48px;
        height: 48px;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
      }
    }

    .more-media-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: 700;
    }
  }
}

.interaction-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eff3f4;

  .interaction-item {
    flex: 1;
    display: flex;
    justify-content: center;

    :deep(.t-button) {
      color: #536471;
      transition: all 0.2s ease;

      &:hover {
        background-color: rgba(29, 155, 240, 0.1);
        color: #1d9bf0;
      }

      &.t-button--theme-danger {
        color: #f91880;

        &:hover {
          background-color: rgba(249, 24, 128, 0.1);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .weibo-layout {
    .weibo-container {
      padding: 12px 8px;
      max-width: 100%;
    }
  }

  .weibo-card {
    margin-bottom: 12px;
    padding: 12px;
    border-radius: 8px;
  }

  .user-info {
    .avatar {
      width: 40px;
      height: 40px;
      margin-right: 8px;
    }

    .user-details {
      .username {
        font-size: 14px;
      }

      .user-handle,
      .post-time {
        font-size: 12px;
      }
    }
  }

  .post-content {
    .post-text {
      font-size: 14px;
      line-height: 18px;
    }
  }

  .media-grid {
    max-height: 300px;
    border-radius: 8px;
  }
}

@media (max-width: 480px) {
  .weibo-layout {
    .weibo-container {
      padding: 8px 4px;
    }
  }

  .weibo-card {
    padding: 8px;
    margin-bottom: 8px;
  }

  .media-grid {

    &.grid-3,
    &.grid-6,
    &.grid-9 {
      grid-template-columns: 1fr 1fr;
    }
  }
}
</style>
