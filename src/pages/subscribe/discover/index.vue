<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 返回按钮 -->
    <div class="flex items-center p-4">
      <t-button @click="goBack" class="flex items-center text-gray-600 hover:text-gray-800">
        <ChevronLeftIcon class="w-5 h-5 mr-1" />
        <span>返回</span>
      </t-button>
    </div>

    <!-- 页面标题 -->
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900">发现</h1>
    </div>

    <!-- 标签页导航 -->
    <div class="max-w-4xl mx-auto px-4 tabs-centered">
      <t-tabs v-model="activeTab" placement="top" size="medium">

        <t-tab-panel value="rss" label="RSS">
          <!-- RSS URL 输入区域 -->
          <div class="max-w-md mx-auto mb-8 mt-16">
            <div class="mb-4">
              <t-space size="small" class="mb-2">
                <span class="font-bold">RSS URL</span>
                <t-link class="ml-2" theme="primary" href="https://github.com/RSSNext/Folo/wiki/Folo-Flavored-Feed-Spec"
                  target="_blank">
                  <book-icon class="mr-2" />
                  File | Favored Feed Spec
                </t-link>
              </t-space>
              <div>
                <t-input v-model="rssUrl" placeholder="https://" class="flex-1" />
                <div class="mt-8px w-full flex justify-center">
                  <t-button @click="handleRssSubmit" :disabled="!rssUrl.trim() || rssUrl === 'https://'" theme="primary"
                    variant="base">
                    预览
                  </t-button>
                </div>
              </div>
            </div>
          </div>

          <div class="text-center text-gray-500 py-8">
            请输入 RSS URL 进行订阅
          </div>
        </t-tab-panel>

        <t-tab-panel value="rsshub" label="RSSHub">
          <div class="text-center text-gray-500 py-8">
            RSSHub 订阅源列表
          </div>
        </t-tab-panel>

        <t-tab-panel value="internal" label="内部">
          <div class="text-center text-gray-500 py-8">
            收藏夹功能开发中...
          </div>
        </t-tab-panel>

        <t-tab-panel value="customer" label="转换">
          <div class="text-center text-gray-500 py-8">
            用户订阅功能开发中...
          </div>
        </t-tab-panel>


        <t-tab-panel value="import" label="导入">
          <div class="text-center text-gray-500 py-8">
            导入功能开发中...
          </div>
        </t-tab-panel>
      </t-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ChevronLeftIcon, BookIcon } from 'tdesign-icons-vue-next'
import { pluginSubscribeParse } from '@/apis/plugin/subscribe'
import { SourceSubscribePostParam } from '@/types/SourceSubscribe'
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
/* 自定义样式 */
.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease;
}

/* 标签页居中样式 */
.tabs-centered {

  :deep(.t-tabs__nav-scroll) {
    justify-content: center;
  }
}
</style>
