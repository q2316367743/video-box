<template>
  <t-layout class="home">
    <header class="home-header">
      <t-select v-model="selectValue" :options="sourceOptions" placeholder="请选择源" class="w-120px" clearable/>
      <t-input v-model="inputValue" placeholder="请输入影视名称" class="w-240px" clearable>
        <template #prefix-icon>
          <search-icon/>
        </template>
      </t-input>
    </header>
    <div class="home-content-wrap">
      <div class="home-content">
        <t-loading :loading>
          <t-card size="small">
            <t-check-tag-group :options="categoryOptions"/>
          </t-card>
          <t-card size="small" class="mt-8px">
            <t-empty style="margin: 15vh 0" v-if="recommends.length === 0"/>
            <div class="waterfall-list">
              <div v-for="r in recommends" :key="r.id" class="waterfall-item">
                <t-card :title="r.title" size="small" hoverable>
                  <!-- 这里可以放置视频缩略图或其他内容 -->
                </t-card>
              </div>
            </div>
            <t-pagination v-model:current="pageNum" :page-size="20" :total class="mt-8px"/>
          </t-card>
        </t-loading>
      </div>
    </div>
  </t-layout>
</template>
<script lang="ts" setup>
import {SearchIcon} from "tdesign-icons-vue-next";
import {useSourceStore} from "@/store";
import {buildVideoPlugin} from "@/core";
import {VideoCategory, VideoPlugin, VideoRecommend} from "@/core/VideoPlugin";
import MessageUtil from "@/utils/modal/MessageUtil";

const inputValue = ref('');
const selectValue = ref('');
const plugin = shallowRef<VideoPlugin | null>(null);

const {sourceOptions} = toRefs(useSourceStore());

const loading = ref(false);
const pageNum = ref(1);
const total = ref(0);
// 推荐
const recommends = ref<Array<VideoRecommend>>([]);
// 分类
const categories = ref<Array<VideoCategory>>([]);
const categoryOptions = computed(() => [{
  label: '全部',
  value: ''
}, ...categories.value.map(e => ({
  label: e.name,
  value: e.id
}))])

watch(selectValue, value => {
  pageNum.value = 1;
  total.value = 0;
  recommends.value = [];
  categories.value = [];
  if (value) {
    const source = useSourceStore().sourceMap.get(value);
    if (!source) return;  // 不存在
    plugin.value = buildVideoPlugin(source);
    fetch()
  }
});
watch(pageNum, () => fetch());

const fetch = () => {
  if (!plugin.value) return;
  if (loading.value) return;
  loading.value = true;
  // 获取首页资源
  plugin.value.home(pageNum.value).then(res => {
    pageNum.value = res.page;
    total.value = res.total;
    recommends.value = res.recommends;
    categories.value = res.categories;
    console.log(res)
  }).catch(e => MessageUtil.error("获取资源数据出错", e))
    .finally(() => loading.value = false);
}
</script>
<style scoped lang="less">
.home {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: var(--td-bg-color-container);

  .home-header {
    padding: 12px;

    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .home-content-wrap {
    width: 100%;
    height: calc(100% - 56px);
    background-color: var(--td-bg-color-page);
    overflow: auto;

    .home-content {
      padding: 8px;

      .waterfall-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        grid-gap: 12px;
      }

      .waterfall-item {
        break-inside: avoid;
      }
    }

  }
}
</style>
