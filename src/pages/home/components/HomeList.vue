<template>
  <div class="home-list" ref="containerRef">
    <div class="home-list-container">
      <t-empty style="margin: 15vh 0" v-if="list.length === 0 && !loading"/>
      <div class="waterfall-list" v-if="list.length > 0">
        <div v-for="r in list" :key="r.id" class="waterfall-item" @click="openOne(r)" :title="r.title">
          <div class="waterfall-item__cover">
            <t-image :src="r.cover" :alt="r.title" lazy fit="cover" style="min-height: 150px">
              <template #error>
                <img src="/video.png" :alt="r.title"/>
              </template>
            </t-image>
            <div class="waterfall-item__tag ellipsis">{{ r.remark }}</div>
          </div>
          <div class="waterfall-item__title ellipsis">{{ r.title }}</div>
          <div class="waterfall-item__remark ellipsis" :title="r.remark">{{ r.remark }}</div>
        </div>
      </div>
      <div v-if="loading" class="w-full text-center my-8px">正在加载中...</div>
      <div v-if="bottom && list.length > 0" class="w-full text-center my-4px">人家也是有底线的</div>
    </div>
    <t-back-top container=".home-list" />
  </div>
</template>
<script lang="ts" setup>
import {VideoCommonResult, VideoListItem, VideoPlugin} from "@/core/VideoPlugin";
import MessageUtil from "@/utils/modal/MessageUtil";
import {usePlayerWindowStore} from "@/store";

const props = defineProps({
  getRecords: {
    type: Function as PropType<(page: number) => Promise<VideoCommonResult>>,
    default: () => ((page: number) => Promise.reject({page, limit: 20, total: 0, data: []}))
  },
  plugin: {
    type: Object as PropType<VideoPlugin>,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['update:loading']);

const containerRef = ref<HTMLDivElement>();
const pageNum = ref(1);
const total = ref(0);
const list = ref<Array<VideoListItem>>([]);
const bottom = ref(false);


const fetch = () => {
  if (props.loading) return;
  if (bottom.value) return;
  if (!props.getRecords) return;
  emit('update:loading', true);
  pageNum.value += 1;
  props.getRecords(pageNum.value)
    .then(res => {
      pageNum.value = res.page;
      total.value = res.total;
      list.value.push(...res.data);
      if (pageNum.value * 20 > total.value) bottom.value = true;
    })
    .catch(e => {
      MessageUtil.error("获取资源数据出错", e);
    })
    .finally(() => emit('update:loading', false));
}


const openOne = (item: VideoListItem) => {
  if (!props.plugin) return;
  usePlayerWindowStore().openPlayerWindow(props.plugin.props, item);
}

useInfiniteScroll(containerRef, () => {
  fetch();
})

watch(() => props.getRecords, () => {
  emit('update:loading', false);
  bottom.value = false;
  pageNum.value = 1;
  total.value = 0;
  list.value = [];
  fetch();
}, {immediate: true, deep: true})

</script>
<style scoped lang="less">
.home-list {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;

  .home-list-container {
    margin: 56px 8px 8px;
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
}
</style>
