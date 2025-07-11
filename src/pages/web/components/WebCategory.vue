<template>
  <div class="home-content-wrapper">
    <div class="home-content">
      <div class="home-category">
        <t-tabs v-model="categoryValue" :disabled="loading">
          <t-tab-panel v-for="t in categoryOptions" :value="t.value" :label="t.label"/>
        </t-tabs>
      </div>
      <web-list v-if="getRecords" v-model:loading="loading" :get-records="getRecords" :plugin="plugin"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {VideoCategory, VideoCommonResult, VideoPlugin} from "@/modules/video/VideoPlugin";
import MessageUtil from "@/utils/modal/MessageUtil";
import WebList from "@/pages/web/components/WebList.vue";

const loading = defineModel({
  type: Boolean,
  default: false
})

const props = defineProps({
  plugin: {
    type: Object as PropType<VideoPlugin>,
    required: true
  }
});
const emit = defineEmits(['changeCategory']);

const categoryValue = ref('');

const first = ref(true);
const getRecords = ref<((page: number) => Promise<VideoCommonResult>) | null>(null);

// 分类
const categories = ref<Array<VideoCategory>>([]);
const categoryOptions = computed(() => [{
  label: '全部',
  value: ''
}, ...categories.value.map(e => ({
  label: e.name,
  value: e.id
}))])

watch(categoryValue, value => {
  getRecords.value = page => {
    return props.plugin?.getVideos(value, page)
  }
  emit('changeCategory');
}, {immediate: true});

onMounted(() => {
  if (!props.plugin) return;
  // 获取首页资源
  loading.value = true;
  props.plugin.home(1).then(res => {
    categories.value = res.categories;
    loading.value = false;
    first.value = false;
  }).catch(e => MessageUtil.error("获取资源数据出错", e))
});

defineExpose({
  search: (keyword: string) => {
    if (keyword) {
      getRecords.value = page => {
        return props.plugin?.searchVideos(keyword, page)
      }
    } else {
      getRecords.value = page => {
        return props.plugin?.getVideos(categoryValue.value, page)
      }
    }
  }
})
</script>
<style scoped lang="less">

.home-content-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.home-category {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
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
    margin-top: 4px;
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
