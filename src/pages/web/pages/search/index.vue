<template>
  <sub-page-layout title="资源搜索">
    <template #extra>
      <t-input v-model="keyword" placeholder="请输入资源名，回车搜索" clearable
               @enter="handleSearch" style="min-width: 200px; max-width: 400px;width: 33vw" :disabled="loading">
        <template #suffix-icon>
          <search-icon/>
        </template>
      </t-input>
    </template>
    <loading-result v-if="loading && results.length === 0" title="正在搜索中"/>
    <empty-result v-else-if="results.length === 0" title="暂无资源"/>
    <div class="waterfall-list" v-else>
      <web-item v-for="r in results" :key="r.id" :r="r"/>
    </div>
  </sub-page-layout>
</template>
<script lang="ts" setup>
import {uid} from 'radash'
import {SearchIcon} from "tdesign-icons-vue-next";
import {VideoListItem} from "@/modules/video/VideoPlugin";
import MessageUtil from "@/utils/modal/MessageUtil";
import {pluginWebSearch} from "@/apis/plugin/web.ts";
import WebItem from "@/pages/web/pages/components/WebItem.vue";

const route = useRoute();

const id = route.params.id as string;


const keyword = ref(route.query.keyword as string);

const results = ref(new Array<VideoListItem>());
const uuid = ref('');
const loading = ref(false);

const page = ref(1);
const total = ref(0);

async function handleSearch() {
  results.value = [];
  if (!keyword.value) return;
  const flag = uid(8);
  const k = keyword.value;
  uuid.value = flag;
  try {
    loading.value = true;
    const res = await pluginWebSearch(id, k, page.value);
    page.value = res.page;
    total.value = res.total;
    results.value = res.data;
  } catch (e) {
    MessageUtil.error("搜索失败", e);
  } finally {
    if (flag === uuid.value) {
      loading.value = false;
    }
  }
}

</script>
<style scoped lang="less">

.waterfall-list {
  position: relative;
  /* 使用 column-width 实现自适应列数 */
  column-width: 200px;
  column-gap: 8px;
  padding: 8px;
}
</style>
