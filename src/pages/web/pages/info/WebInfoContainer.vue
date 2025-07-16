<template>
  <div class="web-content">
    <div class="web-category" ref="headerRef">
      <web-info-header v-model="categoryValue" :menus="categoryOptions" :plugin/>
    </div>
    <div class="web-list" ref="containerRef" :style="{height: (winSize.height.value - headerSize.height.value) + 'px'}">
      <div class="web-list-container">
        <t-empty style="margin: 15vh 0" v-if="list.length === 0 && !loading"/>
        <div class="waterfall-list" ref="listRef">
          <web-item v-for="r in list" :key="r.id" :r="r" :plugin="plugin" :macy/>
        </div>
        <div v-if="loading" class="w-full text-center my-8px">正在加载中...</div>
        <div v-if="bottom && list.length > 0" class="w-full text-center my-8px">人家也是有底线的</div>
      </div>
      <t-back-top container=".web-list"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import Macy from "macy";
import {VideoCategory, VideoListItem, VideoPlugin} from "@/modules/video/VideoPlugin";
import MessageUtil from "@/utils/modal/MessageUtil";
import WebInfoHeader from "@/pages/web/pages/info/WebInfoHeader.vue";
import WebItem from "@/pages/web/pages/components/WebItem.vue";

const props = defineProps({
  plugin: {
    type: Object as PropType<VideoPlugin>,
    required: true
  }
});

const headerRef = ref<HTMLDivElement>();
const containerRef = ref<HTMLDivElement>();
const listRef = ref<HTMLDivElement>();

const macy = shallowRef<Macy>()

const categoryValue = ref('');
const first = ref(true);
const loading = ref(false);
const pageNum = ref(1);
const total = ref(0);
const list = ref<Array<VideoListItem>>([]);
const bottom = ref(false);

const winSize = useWindowSize();
const headerSize = useElementSize(headerRef);

// 分类
const categories = ref<Array<VideoCategory>>([]);
const categoryOptions = computed<Array<VideoCategory>>(() => ([{
  name: '全部',
  id: '',
  children: [],
  cover: ''
} as VideoCategory, ...categories.value]))


const fetch = () => {
  if (loading.value) return;
  if (bottom.value) return;
  loading.value = true;
  pageNum.value += 1;
  props.plugin.getVideos(categoryValue.value, pageNum.value)
    .then(res => {
      pageNum.value = res.page;
      total.value = res.total;
      list.value.push(...res.data);
      if (pageNum.value * 20 > total.value) bottom.value = true;
    })
    .catch(e => {
      MessageUtil.error("获取资源数据出错", e);
      bottom.value = true;
    })
    .finally(() => {
      loading.value = false;
      macy.value?.recalculate();
    });
}

watch(categoryValue, () => {
  pageNum.value = 1;
  total.value = 0;
  list.value = [];
  bottom.value = false;
  fetch();
}, {immediate: true});

onMounted(() => {
  if (!props.plugin) return;
  // 获取首页资源
  loading.value = true;
  props.plugin.home(1).then(res => {
    categories.value = res.categories;
    loading.value = false;
    first.value = false;
  }).catch(e => MessageUtil.error("获取资源数据出错", e));

  if (listRef.value) {
    // 瀑布流
    macy.value = new Macy({
      container: listRef.value,
      trueOrder: false,
      waitForImages: false,
      margin: 8,
      columns: 3,
      breakAt: {
        1960: 6,
        1600: 5,
        1200: 4,
        960: 3,
        520: 2,
        400: 1
      }
    });
  }
});
onBeforeMount(() => {
  macy.value?.remove();
});
useInfiniteScroll(containerRef, () => {
  fetch();
})
</script>
<style scoped lang="less">
.web-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  list-style: none;
}

.web-category {
  overflow-x: auto;
  overflow-y: hidden;

  :deep(.t-submenu) {
    margin: 0;
  }
}

.web-list {
  flex: auto;
  height: 500px;
  overflow: auto;

  .web-list-container {
    margin: 8px;
  }

  .waterfall-list {
    margin-top: 8px;
  }


}
</style>