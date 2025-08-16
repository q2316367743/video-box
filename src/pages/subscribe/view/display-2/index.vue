<template>
  <div class="weibo-layout" ref="containerRef">
    <div class="weibo-container">
      <!-- 使用微博卡片组件 -->
      <WeiboCard 
        v-for="record in records" 
        :key="record.id" 
        :record="record"
      />
      
      <!-- 加载更多指示器 -->
      <div v-if="loading" class="loading-indicator">
        <t-loading size="small" />
        <span>加载中...</span>
      </div>
      
      <!-- 没有更多数据提示 -->
      <div v-if="!hasMore && records.length > 0" class="no-more-data">
        没有更多数据了
      </div>
      
      <!-- 空状态 -->
      <div v-if="!loading && records.length === 0" class="empty-state">
        暂无数据
      </div>
    </div>

    <t-back-top container=".weibo-layout" />
  </div>
</template>

<script lang="ts" setup>
import { PluginSubscribeRecord } from '@/apis/plugin/subscribe';
import { SourceSubscribeRecordListView } from '@/types/SourceSubscribe';
import WeiboCard from './components/WeiboCard.vue';

const route = useRoute();

const listId = ref(route.params.listId as string);
const loading = ref(false);
const records = ref<Array<SourceSubscribeRecordListView>>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const containerRef = ref<HTMLElement>();

// 计算是否还有更多数据
const hasMore = computed(() => {
  return records.value.length < total.value;
});

// 加载记录数据
const loadRecords = async (isLoadMore = false) => {
  if (!listId.value || loading.value) return;

  loading.value = true;
  try {
    const result = await PluginSubscribeRecord(
      '2',
      listId.value,
      currentPage.value,
      pageSize.value
    );

    if (result) {
      if (isLoadMore) {
        // 追加数据
        records.value.push(...(result.records || []));
      } else {
        // 重置数据
        records.value = result.records || [];
      }
      total.value = result.total || 0;
    }
  } catch (error) {
    console.error('加载记录失败:', error);
  } finally {
    loading.value = false;
  }
};

// 加载更多数据
const loadMore = async () => {
  if (!hasMore.value || loading.value) return;
  
  currentPage.value++;
  await loadRecords(true);
};

// 滚动监听，实现懒加载
const handleScroll = () => {
  if (!containerRef.value || loading.value || !hasMore.value) return;

  const container = containerRef.value;
  const scrollTop = container.scrollTop;
  const scrollHeight = container.scrollHeight;
  const clientHeight = container.clientHeight;

  // 当滚动到距离底部200px时触发加载
  if (scrollTop + clientHeight >= scrollHeight - 200) {
    loadMore();
  }
};

// 重置数据
const resetData = () => {
  currentPage.value = 1;
  records.value = [];
  total.value = 0;
};

// 监听路由参数变化
watch(() => route.params.listId, (newId) => {
  listId.value = newId as string;
  resetData();
  loadRecords();
});

onMounted(() => {
  loadRecords();
  
  // 添加滚动监听
  if (containerRef.value) {
    containerRef.value.addEventListener('scroll', handleScroll);
  }
});

onUnmounted(() => {
  // 移除滚动监听
  if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', handleScroll);
  }
});
</script>

<style scoped lang="less">
.weibo-layout {
  min-height: 100vh;
  background-color: var(--td-bg-color-page);
  overflow-y: auto;
  height: 100vh;

  .weibo-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px 16px;
  }

  .loading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: var(--td-text-color-secondary);
    gap: 8px;
    font-size: 14px;
  }

  .no-more-data {
    text-align: center;
    padding: 20px;
    color: var(--td-text-color-placeholder);
    font-size: 14px;
    background-color: var(--td-bg-color-container);
    border-radius: 8px;
    margin: 16px 0;
    border: 1px solid var(--td-border-level-1-color);
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--td-text-color-placeholder);
    font-size: 16px;
    background-color: var(--td-bg-color-container);
    border-radius: 12px;
    border: 1px solid var(--td-border-level-1-color);
    margin: 20px 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .weibo-layout {
    .weibo-container {
      padding: 12px 8px;
      max-width: 100%;
    }

    .loading-indicator {
      padding: 16px;
      font-size: 13px;
    }

    .no-more-data {
      padding: 16px;
      font-size: 13px;
      margin: 12px 0;
      border-radius: 6px;
    }

    .empty-state {
      height: 150px;
      font-size: 15px;
      border-radius: 8px;
      margin: 16px 0;
    }
  }
}

@media (max-width: 480px) {
  .weibo-layout {
    .weibo-container {
      padding: 8px 4px;
    }

    .loading-indicator {
      padding: 12px;
      font-size: 12px;
    }

    .no-more-data {
      padding: 12px;
      font-size: 12px;
      margin: 8px 0;
      border-radius: 4px;
    }

    .empty-state {
      height: 120px;
      font-size: 14px;
      border-radius: 6px;
      margin: 12px 0;
    }
  }
}
</style>
