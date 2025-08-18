<template>
  <div class="discover-page">
    <!-- 返回按钮 -->
    <div class="back-button-container">
      <t-button @click="goBack" theme="primary" variant="text">
        <template #icon>
          <ChevronLeftIcon />
        </template>
        <span>返回</span>
      </t-button>
    </div>

    <!-- 页面标题 -->
    <div class="page-title">
      <h1 class="title-text">发现</h1>
    </div>

    <!-- 标签页导航 -->
    <div class="tabs-container">
      <t-tabs v-model="activeTab" placement="top" size="medium">

        <t-tab-panel value="rss" label="RSS">
          <!-- RSS URL 输入区域 -->
          <div class="rss-input-container">
            <div class="input-section">
              <t-space size="small" class="input-header">
                <span class="input-label">RSS URL</span>
                <t-link class="spec-link" theme="primary"
                  href="https://github.com/RSSNext/Folo/wiki/Folo-Flavored-Feed-Spec" target="_blank">
                  <book-icon class="spec-icon" />
                  File | Favored Feed Spec
                </t-link>
              </t-space>
              <div>
                <t-input v-model="rssUrl" placeholder="https://" class="rss-input" />
                <div class="submit-button-container">
                  <t-button @click="handleRssSubmit" :disabled="!rssUrl.trim() || rssUrl === 'https://'" theme="primary"
                    variant="base">
                    预览
                  </t-button>
                </div>
              </div>
            </div>
          </div>

          <div class="placeholder-text">
            请输入 RSS URL 进行订阅
          </div>
        </t-tab-panel>

        <t-tab-panel value="rsshub" label="RSSHub">
          <div class="placeholder-text">
            RSSHub 订阅源列表
          </div>
        </t-tab-panel>

        <t-tab-panel value="internal" label="内部">
          <div class="placeholder-text">
            收藏夹功能开发中...
          </div>
        </t-tab-panel>

        <t-tab-panel value="customer" label="转换">
          <div class="placeholder-text">
            用户订阅功能开发中...
          </div>
        </t-tab-panel>

        <t-tab-panel value="import" label="导入">
          <div class="placeholder-text">
            导入功能开发中...
          </div>
        </t-tab-panel>
      </t-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ChevronLeftIcon, BookIcon } from 'tdesign-icons-vue-next'
import { openSubscribeDiscoverRssDialog } from './dialog/SubscribeDiscoverDialog'

const router = useRouter()

// 响应式数据
const activeTab = ref('rss')
const rssUrl = ref('https://')

// 返回功能
const goBack = () => {
  router.back()
}

// 处理 RSS 提交
const handleRssSubmit = async () => {
  if (!rssUrl.value.trim() || rssUrl.value === 'https://') {
    return
  }
  openSubscribeDiscoverRssDialog(rssUrl.value);
}
</script>

<style scoped lang="less">
.discover-page {
  min-height: 100vh;
  background-color: var(--td-bg-color-page);
  color: var(--td-text-color-primary);
}

.back-button-container {
  display: flex;
  align-items: center;
  padding: 16px;

}

.page-title {
  text-align: center;
  margin-bottom: 32px;

  .title-text {
    font-size: 24px;
    font-weight: bold;
    color: var(--td-text-color-primary);
    margin: 0;
  }
}

.tabs-container {
  max-width: 896px;
  margin: 0 auto;
  padding: 0 16px;

  :deep(.t-tabs__nav-scroll) {
    justify-content: center;
  }
}

.rss-input-container {
  max-width: 448px;
  margin: 0 auto 32px;
  margin-top: 64px;

  .input-section {
    margin-bottom: 16px;

    .input-header {
      margin-bottom: 8px;

      .input-label {
        font-weight: bold;
        color: var(--td-text-color-primary);
      }

      .spec-link {
        margin-left: 8px;

        .spec-icon {
          margin-right: 8px;
        }
      }
    }

    .rss-input {
      flex: 1;
    }

    .submit-button-container {
      margin-top: 8px;
      width: 100%;
      display: flex;
      justify-content: center;
    }
  }
}

.placeholder-text {
  text-align: center;
  color: var(--td-text-color-placeholder);
  padding: 32px 0;
}

// 过渡动画
.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease;
}
</style>
