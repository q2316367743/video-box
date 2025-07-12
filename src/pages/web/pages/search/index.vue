<template>
  <sub-page-layout title="资源搜索">
    <template #extra>
      <t-space size="small">
        <t-tag theme="primary" variant="outline" size="large" v-if="loading" closable @close="handleStop">
          正在搜索 {{ current }} / {{ total }}
        </t-tag>
        <t-input v-model="keyword" placeholder="请输入搜索内容" @enter="handleSearch" style="width: 180px">
          <template #prefix-icon>
            <search-icon/>
          </template>
        </t-input>
      </t-space>
    </template>
    <loading-result v-if="loading && results.length === 0" title="正在搜索中"/>
    <empty-result v-else-if="results.length === 0" title="暂无资源"/>
    <t-tabs v-model="activeKey">
      <t-tab-panel v-for="r in results" :value="r.id" :label="r.title">
        <div class="waterfall-list">
          <web-item v-for="i in r.list" :key="i.id" :r="i" :plugin="r.plugin"/>
        </div>
      </t-tab-panel>
    </t-tabs>
  </sub-page-layout>
</template>
<script lang="ts" setup>
import {uid} from 'radash'
import {SearchIcon} from "tdesign-icons-vue-next";
import {useVideoSourceStore} from "@/store";
import {VideoListItem, VideoPlugin} from "@/modules/video/VideoPlugin";
import {buildVideoPlugin} from "@/modules/video";
import {VideoSourceEntry} from "@/entities/VideoSource";
import MessageUtil from "@/utils/modal/MessageUtil";
import WebItem from "@/pages/web/pages/components/WebItem.vue";

interface Result extends VideoSourceEntry {
  list: Array<VideoListItem>;
  plugin: VideoPlugin;
}

const route = useRoute();

const sources = computed(() => useVideoSourceStore().sources);
const pluginMap = new Map<string, VideoPlugin>();

const keyword = ref(route.query.keyword as string);
const results = ref(new Array<Result>());
const uuid = ref('');
const loading = ref(false);
const activeKey = ref('');

const total = ref(0);
const current = ref(1);

async function handleSearch() {
  results.value = [];
  if (!keyword.value) return;
  const flag = uid(8);
  const k = keyword.value;
  uuid.value = flag;
  try {
    loading.value = true;
    let first = true;
    total.value = sources.value.length;
    current.value = 0;

    await Promise.all(sources.value.map(async source => {
      let plugin = pluginMap.get(source.id);
      if (!plugin) {
        plugin = buildVideoPlugin(source);
        pluginMap.set(source.id, plugin);
      }
      try {
        const res = await plugin.searchVideos(k, 1)
        if (flag !== uuid.value) return;
        current.value += 1;
        console.log(source, res);
        if (!res.data || res.data.length === 0) return;
        results.value.push({
          ...source,
          list: res.data,
          plugin: plugin
        });
        console.log(results.value)
        if (first) {
          activeKey.value = source.id;
          first = false;
        }
      } catch (e) {
        if (flag === uuid.value) {
          MessageUtil.error(source.title + "搜索失败", e);
          current.value += 1;
        }
      }
    }));
  } catch (e) {
    MessageUtil.error("搜索失败", e);
  } finally {
    if (flag === uuid.value) {
      loading.value = false;
    }
  }
}

function handleStop() {
  uuid.value = '';
  loading.value = false;
}

onMounted(handleSearch)
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
