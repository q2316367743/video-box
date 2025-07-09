<template>
  <div class="live-list" ref="el">
    <loading-result v-if="loading" title="正在加载中"/>
    <empty-result v-else-if="results.length === 0" status="404" title="没有频道"/>
    <div class="live-list-container">
      <t-tabs v-model="activeKey">
        <t-tab-panel v-for="name in groupNames" :key="name.value" :label="name.label" :value="name.value"/>
      </t-tabs>
      <div class="container-content" ref="contentContainer" @scroll="handleScroll">
        <!-- 仅渲染当前加载的项目 -->
        <LiveListItem v-for="item in currentlyLoadedResults" :key="item.url" :item="item"/>
        <!-- 加载更多提示 -->
        <div v-if="currentlyLoadedResults.length < results.length" class="loading-more" @click="handleScroll">
          正在加载更多...
        </div>
      </div>
    </div>
    <t-back-top container=".container-content"/>
  </div>
</template>
<script lang="ts" setup>
import {ref, computed, onMounted} from "vue";
import {M3u8ChannelWrap} from "@/entities/LiveSource";
import LiveListItem from "@/pages/live/components/LiveListItem.vue";
import {channelsToGroup} from "@/utils/file/M3u8Util";

const props = defineProps({
  channels: {
    type: Object as PropType<Array<M3u8ChannelWrap>>,
    default: []
  },
  loading: {
    type: Boolean,
    default: false
  },
  active: {
    type: Number,
    default: 0
  }
});

const activeKey = ref('');
const contentContainer = ref<HTMLDivElement | null>(null);

const groups = computed(() => channelsToGroup(props.channels));
const groupNames = computed(() => [{
  label: '全部',
  value: ''
}, ...groups.value.map(e => ({
  label: e.group,
  value: e.group
}))]);
const results = computed<Array<M3u8ChannelWrap>>(() => {
  if (activeKey.value === '') {
    return props.channels;
  }
  currentlyLoadedCount.value = initialLoadCount;
  contentContainer.value?.scrollTo(0, 0);
  return props.channels.filter(e => e.group === activeKey.value)
});

// 初始加载数量
const initialLoadCount = 20;
// 每次滚动到底部时加载的数量
const loadMoreCount = 10;
// 当前加载的项目数量
const currentlyLoadedCount = ref(initialLoadCount);

// 当前加载的项目
const currentlyLoadedResults = computed(() => {
  return results.value.slice(0, currentlyLoadedCount.value);
});

// 处理滚动事件
const handleScroll = () => {
  if (!contentContainer.value) return;
  const {scrollTop, scrollHeight, clientHeight} = contentContainer.value;
  // 当滚动到接近底部时加载更多
  if (scrollTop + clientHeight >= scrollHeight - 200 && currentlyLoadedCount.value < results.value.length) {
    currentlyLoadedCount.value += loadMoreCount;
  }
};

onMounted(() => {
  // 初始加载
  currentlyLoadedCount.value = initialLoadCount;
});
watch(() => props.active, () => {
  activeKey.value = '';
})
</script>
<style scoped lang="less">
.live-list {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  .live-list-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;

    .loading-more {
      width: 100%;
      text-align: center;
      padding: 10px;
      cursor: pointer;
    }

    bottom: 0;

    .container-content {
      position: absolute;
      top: 48px;
      left: 0;
      right: 0;
      bottom: 0;
      width: calc(100% - 16px);
      padding: 8px;
      display: flex;
      align-items: flex-start;
      align-content: flex-start;
      flex-wrap: wrap;
      overflow: auto;
      gap: 8px;
    }
  }

}
</style>
