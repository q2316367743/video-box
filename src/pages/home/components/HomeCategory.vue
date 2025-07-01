<template>
  <div class="w-full">
    <t-loading :loading>
      <div class="home-category">
        <t-card size="small">
          <t-tabs v-model="categoryValue">
            <t-tab-panel v-for="t in categoryOptions" :value="t.value" :label="t.label"/>
          </t-tabs>
        </t-card>
      </div>
      <t-card size="small">
        <t-empty style="margin: 15vh 0" v-if="list.length === 0"/>
        <div class="waterfall-list">
          <div v-for="r in list" :key="r.id" class="waterfall-item" @click="openOne(r)">
            <div class="waterfall-item__cover">
              <t-image :src="r.cover" :alt="r.title" lazy fit="cover"/>
              <div class="waterfall-item__tag ellipsis">{{ r.remark }}</div>
            </div>
            <div class="waterfall-item__title">{{ r.title }}</div>
            <div class="waterfall-item__remark ellipsis" :title="r.remark">{{ r.remark }}</div>
          </div>
        </div>
      </t-card>
    </t-loading>
    <t-card size="small" class="mt-8px">
      <t-pagination v-model="pageNum" :page-size="20" :total class="mt-8px"/>
    </t-card>
  </div>
</template>
<script lang="ts" setup>
import {VideoCategory, VideoListItem, VideoPlugin} from "@/core/VideoPlugin";
import MessageUtil from "@/utils/modal/MessageUtil";
import {usePlayerWindowStore} from "@/store";

const props = defineProps({
  plugin: {
    type: Object as PropType<VideoPlugin>,
    required: true
  }
});

const categoryValue = ref('');

const loading = ref(false);
const pageNum = ref(1);
const total = ref(0);
const list = ref<Array<VideoListItem>>([]);

// 分类
const categories = ref<Array<VideoCategory>>([]);
const categoryOptions = computed(() => [{
  label: '全部',
  value: ''
}, ...categories.value.map(e => ({
  label: e.name,
  value: e.id
}))])


const fetch = () => {
  if (loading.value) return;
  if (!props.plugin) return;
  loading.value = true;
  props.plugin?.getVideos(categoryValue.value, pageNum.value)
    .then(res => {
      pageNum.value = res.page;
      total.value = res.total;
      list.value = res.data
    })
    .catch(e => {
      MessageUtil.error("获取资源数据出错", e);
      list.value = [];
    })
    .finally(() => loading.value = false);
}

const openOne = (item: VideoListItem) => {
  if (!props.plugin) return;
  usePlayerWindowStore().openPlayerWindow(props.plugin.props, item);
}

watch(categoryValue, () => {
  loading.value = false;
  pageNum.value = 1;
  total.value = 0;
  list.value = [];
  fetch();
});
watch(pageNum, () => fetch());
onMounted(() => {
  if (!props.plugin) return;
  // 获取首页资源
  loading.value = true;
  props.plugin.home(1).then(res => {
    categories.value = res.categories;
    loading.value = false;
    // 获取资源
    fetch();
  }).catch(e => MessageUtil.error("获取资源数据出错", e))
});
</script>
<style scoped lang="less">
.home-category {
  position: sticky;
  top: 0;
  z-index: 2;
  margin-bottom: 8px;
}

.waterfall-list {
  margin-top: 8px;
  /* 使用 column-width 实现自适应列数 */
  column-width: 200px;
  column-gap: 12px;
}

.waterfall-item {
  break-inside: avoid;
  position: relative;
  cursor: pointer;
  margin-bottom: 12px;
  display: inline-block;
  width: 100%;

  &__cover {
    position: relative;
    overflow: hidden;
    border-radius: var(--td-radius-medium);

    :deep(img) {
      transition: transform 0.3s ease;
    }
  }

  &__tag {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    background-color: #ffdd9a;
    max-width: 80%;
    padding: 3px 6px;
    color: #4f3007;
    font-weight: bold;
    border-radius: var(--td-radius-medium) 0;
    font-size: var(--td-font-size-body-medium);
    user-select: none;
  }

  &__title {
    font-size: var(--td-font-size-title-medium);
    font-weight: bold;
    color: var(--td-text-color-primary);
    transition: color 0.3s ease;
  }

  &__remark {
    margin-top: 2px;
    font-size: var(--td-font-body-medium);
    color: var(--td-text-color-secondary);
  }

  &:hover {
    .waterfall-item__cover :deep(img) {
      transform: scale(1.02);
    }

    .waterfall-item__title {
      color: var(--td-brand-color);
    }
  }
}
</style>
