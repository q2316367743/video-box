<template>
  <div class="weibo-card" :data-record-id="record.id">
    <!-- 用户信息区域 -->
    <div class="user-info">
      <div class="avatar">
        <img :src="record.subscribe?.icon || '/default-avatar.png'" :alt="record.subscribe?.name || '用户'" />
      </div>
      <div class="user-details">
        <div class="username">{{ record.subscribe?.name || '匿名用户' }}</div>
        <div class="post-time">{{ formatTime(record.pub_date) }}</div>
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
        <div :class="['text-content', { 'expanded': expanded }]" v-html="record.description"></div>
        <div v-if="shouldShowExpandButton" class="expand-button" @click="handleToggleExpand">
          {{ expanded ? '收起' : '展开' }}
        </div>
      </div>

      <!-- 媒体网格 -->
      <div v-if="record.medias && record.medias.length > 0" class="media-grid"
        :class="`grid-${getGridClass(record.medias.length)}`">
        <div v-for="(media, index) in record.medias.slice(0, 9)" :key="index" class="media-item"
          @click="handleShowMedia(record.medias, index)">
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
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { SourceSubscribeRecordListView } from '@/types/SourceSubscribe'
import { prettyDate } from '@/utils/lang/FormatUtil'
import { MoreIcon, PlayIcon } from 'tdesign-icons-vue-next'
import { showMediaPlugin } from "@/plugin/MediaPlugin.tsx"

interface Props {
  record: SourceSubscribeRecordListView
}

const props = defineProps<Props>()

const expanded = ref(false)
const shouldShowExpandButton = ref(false)
const maxHeight = 120

// 格式化时间
const formatTime = (dateStr: number | string | Date) => {
  return prettyDate(dateStr)
}

// 根据媒体数量确定网格布局类型
const getGridClass = (count: number): string => {
  if (count === 1) return '1'
  if (count === 2) return '2'
  if (count === 3) return '3'
  if (count === 4) return '4'
  if (count <= 6) return '6'
  return '9'
}

// 切换展开状态
const handleToggleExpand = () => {
  expanded.value = !expanded.value
}

// 显示媒体
const handleShowMedia = (medias: any[], index: number) => {
  showMediaPlugin(medias, index)
}

// 检查是否需要展开按钮
const checkTextHeight = () => {
  nextTick(() => {
    const textElement = document.querySelector(`[data-record-id="${props.record.id}"] .text-content`)
    if (textElement) {
      shouldShowExpandButton.value = textElement.scrollHeight > maxHeight
    }
  })
}

onMounted(() => {
  checkTextHeight()
})
</script>

<style scoped lang="less">
.weibo-card {
  background: var(--td-bg-color-container);
  border-radius: 12px;
  margin-bottom: 16px;
  padding: 16px;
  box-shadow: var(--td-shadow-1);
  border: 1px solid var(--td-border-level-1-color);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: var(--td-shadow-2);
    background: var(--td-bg-color-container-hover);
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
    border: 1px solid var(--td-border-level-1-color);

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
      color: var(--td-text-color-primary);
      line-height: 20px;
    }

    .user-handle {
      font-size: 13px;
      color: var(--td-text-color-secondary);
      line-height: 16px;
    }

    .post-time {
      font-size: 13px;
      color: var(--td-text-color-secondary);
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
    color: var(--td-text-color-primary);
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
        background: linear-gradient(transparent, var(--td-bg-color-container) 50%, var(--td-bg-color-container));
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
      color: var(--td-text-color-brand);
      cursor: pointer;
      font-size: 14px;
      margin-top: 8px;
      user-select: none;

      &:hover {
        text-decoration: underline;
        color: var(--td-brand-color-hover);
      }
    }

    :deep(p) {
      margin: 0 0 12px 0;

      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(a) {
      color: var(--td-text-color-link);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
        color: var(--td-brand-color-hover);
      }
    }
  }
}

.media-grid {
  border-radius: 12px;
  overflow: hidden;
  display: grid;
  gap: 2px;
  border: 1px solid var(--td-border-level-1-color);

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
    background: var(--td-bg-color-secondarycontainer);
    cursor: pointer;
    overflow: hidden;
    aspect-ratio: 1;

    &:hover {
      opacity: 0.9;
      background: var(--td-bg-color-secondarycontainer-hover);
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
        background: var(--td-mask-active);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--td-text-color-anti);
        font-size: 20px;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(0, 0, 0, 0.8);
        }
      }
    }

    .more-media-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--td-mask-active);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--td-text-color-anti);
      font-size: 24px;
      font-weight: 700;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
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
