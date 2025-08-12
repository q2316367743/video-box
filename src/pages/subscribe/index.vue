<template>
  <div class="view-container">

    <div class="view-layout">
      <!-- 侧边栏：按分组显示订阅列表 -->
      <div class="view-sidebar">
        <div class="view-header">
          <div class="view-title-row">
            <h2>{{ SubscribeDisplayMap[activeDisplayType] }}</h2>
            <div class="view-actions">
              <t-tooltip content="刷新订阅">
                <t-button theme="default" shape="square" variant="text" @click="refreshSubscribes">
                  <template #icon><t-icon name="refresh" /></template>
                </t-button>
              </t-tooltip>
              <t-tooltip content="添加订阅">
                <t-button theme="default" shape="square" variant="text">
                  <template #icon><t-icon name="add" /></template>
                </t-button>
              </t-tooltip>
              <t-tooltip content="视图设置">
                <t-button theme="default" shape="square" variant="text">
                  <template #icon><t-icon name="setting" /></template>
                </t-button>
              </t-tooltip>
            </div>
          </div>
        </div>
        <display-radio :options="['1', '2', '3', '4', '5', '6']" v-model="activeDisplayType" />
        <t-loading :loading="loading" size="small">
          <t-empty v-if="filteredSubscribeList.length === 0" description="暂无数据" />

          <div v-else class="sidebar-content">

            <!-- 无分组的订阅源直接显示 -->
            <div class="sidebar-list">
              <template v-for="item in ungroupedSubscribes" :key="item.id">
                <div class="sidebar-item" :class="{ active: activeSubscribeId === item.id }"
                  @click="handleSubscribeChange(item.id)">
                  <div class="item-icon">
                    <t-avatar v-if="item.icon" :image="item.icon" size="small" shape="round" />
                    <t-icon v-else name="rss" />
                  </div>
                  <div class="item-content">
                    <div class="item-name">{{ item.name }}</div>
                  </div>
                  <div class="item-count" v-if="item.record_count > 0">
                    {{ item.record_count > 999 ? '999+' : item.record_count }}
                  </div>
                </div>
              </template>
            </div>

            <!-- 分组标题 -->
            <div class="sidebar-section" v-if="Object.keys(groupedSubscribes).length > 0">
              <div class="sidebar-title">订阅源</div>
            </div>

            <!-- 有分组的订阅源显示为折叠菜单 -->
            <div class="sidebar-list">
              <template v-for="(group, groupName) in groupedSubscribes" :key="groupName">
                <!-- 分组标题 -->
                <div class="sidebar-group-header" @click="toggleGroup(groupName)">
                  <div class="group-icon">
                    <t-icon :name="expandedGroups.includes(groupName) ? 'chevron-down' : 'chevron-right'" />
                  </div>
                  <div class="group-name">{{ groupName }}</div>
                  <div class="group-count" v-if="getGroupCount(group) > 0">
                    {{ getGroupCount(group) > 999 ? '999+' : getGroupCount(group) }}
                  </div>
                </div>

                <!-- 分组内容 -->
                <div class="sidebar-group-content" v-show="expandedGroups.includes(groupName)">
                  <div v-for="item in group" :key="item.id" class="sidebar-item"
                    :class="{ active: activeSubscribeId === item.id }" @click="handleSubscribeChange(item.id)">
                    <div class="item-icon">
                      <t-avatar v-if="item.icon" :image="item.icon" size="small" shape="round" />
                      <t-icon v-else name="rss" />
                    </div>
                    <div class="item-content">
                      <div class="item-name">{{ item.name }}</div>
                    </div>
                    <div class="item-count" v-if="item.record_count > 0">
                      {{ item.record_count > 999 ? '999+' : item.record_count }}
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </t-loading>
      </div>

      <!-- 主内容区：子路由内容 -->
      <div class="view-content">
        <router-view></router-view>
      </div>
    </div>
    <t-back-top container=".view-content" />
  </div>
</template>

<script lang="ts" setup>
import { pluginSubscribeList, pluginSubscribeRefresh } from '@/apis/plugin/subscribe';
import { SourceSubscribe, SourceSubscribeDisplay } from '@/types/SourceSubscribe';
import { SubscribeDisplayMap } from './constant';
import DisplayRadio from './components/DisplayRadio.vue';

const route = useRoute();
const router = useRouter();
const subscribeList = ref<SourceSubscribe[]>([]);
const loading = ref(false);
const activeDisplayType = ref<string>('1'); // 默认显示文章类型
const activeSubscribeId = ref<string>(''); // 当前选中的订阅源ID
const expandedGroups = ref<string[]>([]); // 展开的分组

// 根据当前选择的展示类型过滤订阅列表
const filteredSubscribeList = computed(() => {
  const displayType = parseInt(activeDisplayType.value) as SourceSubscribeDisplay;
  return subscribeList.value.filter(item => item.display === displayType);
});

// 无分组的订阅源
const ungroupedSubscribes = computed(() => {
  return filteredSubscribeList.value.filter(item => !item.group);
});

// 按分组整理的订阅源
const groupedSubscribes = computed(() => {
  const groups: Record<string, SourceSubscribe[]> = {};

  filteredSubscribeList.value.forEach(item => {
    if (item.group) {
      if (!groups[item.group]) {
        groups[item.group] = [];
      }
      groups[item.group].push(item);
    }
  });

  // 过滤掉只有一个项目的分组，这些应该直接显示
  const filteredGroups: Record<string, SourceSubscribe[]> = {};
  Object.entries(groups).forEach(([groupName, items]) => {
    if (items.length > 1) {
      filteredGroups[groupName] = items;
    }
  });

  return filteredGroups;
});

// 获取分组中的记录总数
const getGroupCount = (group: SourceSubscribe[]) => {
  return group.reduce((sum, item) => sum + item.record_count, 0);
};

// 获取特定类型的记录总数
const getTypeTotal = (type: SourceSubscribeDisplay) => {
  return subscribeList.value
    .filter(item => item.display === type)
    .reduce((sum, item) => sum + item.record_count, 0);
};

// 刷新订阅列表
const refreshSubscribes = async () => {
  if (activeSubscribeId.value) {
    // 选择订阅则刷新订阅
    await pluginSubscribeRefresh(activeSubscribeId.value);
  } else {
    // 否则刷新列表
    await loadSubscribeList();
  }
};


// 处理订阅源选择变更
const handleSubscribeChange = (value: string) => {
  activeSubscribeId.value = value;
  navigateToSubscribe(value);
};

// 切换分组的展开/折叠状态
const toggleGroup = (groupName: string) => {
  const index = expandedGroups.value.indexOf(groupName);
  if (index === -1) {
    expandedGroups.value.push(groupName);
  } else {
    expandedGroups.value.splice(index, 1);
  }
};

// 导航到特定订阅源
const navigateToSubscribe = (subscribeId: string) => {
  router.push({
    path: `/subscribe/view-${activeDisplayType.value}/list-${subscribeId}/pending`
  });
};

// 加载订阅列表数据
const loadSubscribeList = async () => {
  if (!activeDisplayType.value) return;

  loading.value = true;
  try {
    const result = await pluginSubscribeList(activeDisplayType.value as string);
    if (result) {
      subscribeList.value = result;

      // 如果当前类型没有数据，自动切换到有数据的类型
      // const currentType = route.params.type as string || activeDisplayType.value;
      // const currentTypeSubscribes = subscribeList.value.filter(
      //   item => item.display === parseInt(currentType) as SourceSubscribeDisplay
      // );

      // if (currentTypeSubscribes.length === 0) {
        // const availableTypes = [1, 2, 3, 4, 5, 6].filter(type =>
        //   subscribeList.value.some(item => item.display === type)
        // );
        // if (availableTypes.length > 0) {
        //   const newType = availableTypes[0].toString();
        //   activeDisplayType.value = newType;
        //
        //   // 选择第一个可用的订阅源
        //   const firstSubscribe = subscribeList.value.find(item => item.display === availableTypes[0]);
        //   if (firstSubscribe) {
        //     activeSubscribeId.value = firstSubscribe.id;
        //     navigateToSubscribe(firstSubscribe.id);
        //   }
        // }
      // } else {
      //   activeDisplayType.value = currentType;

        // 如果路由中有subscribeId参数，则使用该参数
        // if (route.params.subscribeId) {
        //   activeSubscribeId.value = route.params.subscribeId as string;
        // } else if (currentTypeSubscribes.length > 0) {
        //   // 否则选择第一个可用的订阅源
        //   activeSubscribeId.value = currentTypeSubscribes[0].id;
        //   navigateToSubscribe(currentTypeSubscribes[0].id);
      //   }
      // }

      // 自动展开所有分组
      expandedGroups.value = Object.keys(groupedSubscribes.value);
    }
  } catch (error) {
    console.error('加载订阅列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 监听路由参数变化
watch(() => route.params.viewId, (newId) => {
  activeDisplayType.value = newId as string;
  activeSubscribeId.value = 'all';
});
watch(activeDisplayType, () => {
  activeSubscribeId.value = 'all';
  // 重新请求API获取数据
  loadSubscribeList();

  // 导航到新的路由，更新view参数，并将list设为all，content设为pending
  router.push({
    path: `/subscribe/view-${activeDisplayType.value}/list-all/pending`
  });
})

watch(() => route.params.type, (newType) => {
  if (newType) {
    activeDisplayType.value = newType as string;
  }
});

watch(() => route.params.subscribeId, (newId) => {
  if (newId) {
    activeSubscribeId.value = newId as string;
  }
});

onMounted(() => {
  // 初始化加载视图数据
  loadSubscribeList();

  // 如果路由中有参数，则使用这些参数
  if (route.params.type) {
    activeDisplayType.value = route.params.type as string;
  }

  if (route.params.subscribeId) {
    activeSubscribeId.value = route.params.subscribeId as string;
  }
});
</script>

<style scoped lang="less">
.view-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-header {
  padding: 8px;
}

.view-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    margin: 0;
    font-size: 18px;
  }
}

.view-actions {
  display: flex;
  gap: 4px;
}

.view-tabs {
  margin-bottom: 16px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 4px;

  .t-icon {
    font-size: 16px;
  }

  .t-badge {
    margin-left: 4px;
  }
}

.view-layout {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.view-sidebar {
  width: 240px;
  border-right: 1px solid var(--td-component-stroke);
  overflow-y: auto;
  background-color: #f5f5f5;
}

.sidebar-content {
  padding: 8px 0;
}

.sidebar-section {
  padding: 8px 16px 4px;
}

.sidebar-title {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
}

.sidebar-list {
  margin-bottom: 8px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  &.active {
    background-color: rgba(0, 0, 0, 0.08);
  }
}

.item-icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  .t-icon {
    font-size: 18px;
    color: #666;
  }
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-count {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  padding: 0 4px;
  min-width: 24px;
  text-align: right;
}

.sidebar-group-header {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
}

.group-icon {
  width: 16px;
  margin-right: 4px;
  display: flex;
  align-items: center;

  .t-icon {
    font-size: 14px;
    color: #666;
  }
}

.group-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.group-count {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  padding: 0 4px;
}

.sidebar-group-content {
  .sidebar-item {
    padding-left: 36px;
  }
}

.view-content {
  flex: 1;
  overflow-y: auto;
  min-height: 300px;
}

// 响应式调整
@media (max-width: 768px) {
  .view-layout {
    flex-direction: column;
  }

  .view-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--td-component-stroke);
    padding-right: 0;
    padding-bottom: 16px;
    margin-bottom: 16px;
  }

  .view-content {
    padding-left: 0;
  }
}
</style>