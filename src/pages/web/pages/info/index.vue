<template>
  <div class="web-content">
    <t-affix :offset-top="80" container=".main">
      <div class="web-category">
        <web-info-header v-model="categoryValue" :menus="categoryOptions" :source-web="sourceWeb"/>
      </div>
    </t-affix>
    <div class="web-list">
      <div class="web-list-container">
        <t-empty style="margin: 15vh 0" v-if="list.length === 0 && !loading"/>
        <div class="waterfall-list" ref="listRef">
          <web-item v-for="r in list" :key="r.id" :r="r" :macy :source-id="sourceWeb?.id"/>
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
import {VideoCategory, VideoListItem} from "@/modules/video/VideoPlugin";
import MessageUtil from "@/utils/modal/MessageUtil";
import WebInfoHeader from "@/pages/web/pages/info/WebInfoHeader.vue";
import WebItem from "@/pages/web/pages/components/WebItem.vue";
import {uid} from "radash";
import {pluginWebHome, pluginWebList} from "@/apis/plugin-web/index.js";
import {SourceWeb} from "@/views/SourceWeb.js";
import {sourceWebInfo} from "@/apis/source/web.js";
import {emitScrollToTop, onScrollToBottom} from "@/store/index.js";

const route = useRoute();

const id = route.params.id as string;

const listRef = ref<HTMLDivElement>();

const macy = shallowRef<Macy>();

const categoryValue = ref('');
const first = ref(true);
const loading = ref(false);
const pageNum = ref(0);
const total = ref(0);
const list = ref<Array<VideoListItem>>([]);
const bottom = ref(false);
// 标记请求
const flag = shallowRef('');

// 分类
const categories = ref<Array<VideoCategory>>([]);
const categoryOptions = computed<Array<VideoCategory>>(() => ([{
  name: '全部',
  id: '',
  children: [],
  cover: ''
} as VideoCategory, ...categories.value]));
const sourceWeb = ref<SourceWeb>()


const fetch = () => {
  if (loading.value) return;
  if (bottom.value) return;
  loading.value = true;
  pageNum.value += 1;
  if (pageNum.value === 1) {
    // 第一页滚动到顶部
    emitScrollToTop.trigger();
  }
  const key = uid(10);
  flag.value = key;
  pluginWebList(id, categoryValue.value, pageNum.value)
    .then(res => {
      // 不是一次请求
      if (flag.value !== key) return;
      pageNum.value = res.page;
      total.value = res.total;
      list.value.push(...res.data);
      if (pageNum.value * 20 > total.value) bottom.value = true;
      nextTick(() => {
        macy.value?.recalculate();
        nextTick(() => {
          macy.value?.recalculateOnImageLoad(true);
        })
      });
    })
    .catch(e => {
      // 不是一次请求
      if (flag.value !== key) return;
      MessageUtil.error("获取资源数据出错", e);
      bottom.value = true;
    })
    .finally(() => {
      // 不是一次请求
      if (flag.value !== key) return;
      loading.value = false;
    });
}

watch(categoryValue, () => {
  pageNum.value = 0;
  total.value = 0;
  list.value = [];
  bottom.value = false;
  loading.value = false;
  fetch();
}, {immediate: true});

onMounted(() => {
  // 获取本身数据
  // 获取首页资源
  loading.value = true;
  pluginWebHome(id, 1).then(res => {
    categories.value = res.categories;
    loading.value = false;
    first.value = false;
  }).catch(e => MessageUtil.error("获取分类数据出错", e));
  sourceWebInfo(id).then(res => sourceWeb.value = res)

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
  onScrollToBottom.on(fetch)
});
onBeforeMount(() => {
  macy.value?.remove();
  onScrollToBottom.off(fetch);
});
</script>
<style scoped lang="less">
.web-content {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  list-style: none;
}

.web-category {
  overflow-x: auto;
  overflow-y: hidden;
  background-color: var(--td-bg-color-container);
  z-index: 49;

  :deep(.t-submenu) {
    margin: 0;
  }
}

.web-list {
  flex: auto;

  .web-list-container {
    margin: 8px;
  }

  .waterfall-list {
    margin-top: 8px;
  }


}
</style>