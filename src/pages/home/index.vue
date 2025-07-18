<template>
  <div class="home">
    <div class="home-content">
      <div class="home-search" :style="{paddingTop: isSearch ? '1rem': '8rem'}">
        <div class="home-search-container">
          <t-input-adornment>
            <template #prepend>
              <folder-select v-model="folder"/>
            </template>
            <t-input v-model="keyword" placeholder="请输入资源名，回车搜索" clearable :disabled="sources.length === 0"
                     size="large" @enter="openSearch" @clear="openSearch"
                     style="width: 40vw;min-width: 350px;max-width: 550px;"/>
            <template #append>
              <t-button theme="primary" shape="square" size="large" @click="openSearch">
                <template #icon>
                  <search-icon/>
                </template>
              </t-button>
            </template>
          </t-input-adornment>
        </div>
      </div>
      <div class="home-container">
        <h2 className="text-2xl font-bold mb-6" v-if="isSearch">"{{ keyword }}"的搜索结果</h2>
        <t-alert v-if="loading" close @close="handleStop">正在搜索「{{ current }} / {{ total }}」</t-alert>
        <search-item v-for="item in searchResults" :key="item.title" :item="item"/>
        <home-recommend v-show="!isSearch" @search="handleRecommendSearch"/>
      </div>
    </div>
    <t-back-top container=".home"/>
  </div>
</template>
<script lang="ts" setup>
import {SearchIcon} from "tdesign-icons-vue-next";
import {useVideoSourceStore, useWebFolderStore} from "@/store/index.js";
import {VideoPlugin} from "@/modules/video/VideoPlugin.js";
import {uid} from "radash";
import {set} from "@/utils/lang/ArrayUtil.js";
import {isEmptyString} from "@/utils/lang/FieldUtil.js";
import {buildVideoPlugin} from "@/modules/video/index.js";
import MessageUtil from "@/utils/modal/MessageUtil.js";
import {SearchResult, SearchResultItem} from "@/pages/home/types/SearchResult.js";
import SearchItem from "@/pages/home/components/SearchItem.vue";
import FolderSelect from "@/pages/home/components/FolderSelect.vue";
import HomeRecommend from "@/pages/home/components/HomeRecommend.vue";


const pluginMap = new Map<string, VideoPlugin>();

const folder = ref('');
const keyword = ref('');
const sources = computed(() => useVideoSourceStore().sources);
const isSearch = ref(false)

const searchResultMap = ref(new Map<string, SearchResult>());
const uuid = ref('');
const loading = ref(false);

const total = ref(0);
const current = ref(1);

const searchResults = computed(() => Array.from(searchResultMap.value.values()));


const openSearch = async () => {
  isSearch.value = keyword.value !== '';
  searchResultMap.value.clear();
  if (!keyword.value) return;
  const flag = uid(8);
  const k = keyword.value;
  uuid.value = flag;
  try {
    loading.value = true;
    const {webFolders} = useWebFolderStore();
    const folderIds = set(webFolders, 'id');
    const temps = sources.value.filter(s => {
      if (isEmptyString(folder.value)) {
        return true;
      } else if (folder.value === 'root') {
        // 根目录
        return !folderIds.has(s.folder)
      } else {
        return s.folder === folder.value;
      }
    });

    total.value = temps.length;
    current.value = 1;

    await Promise.all(temps.map(async source => {
      let plugin = pluginMap.get(source.id);
      if (!plugin) {
        plugin = buildVideoPlugin(source);
        pluginMap.set(source.id, plugin);
      }
      try {
        const res = await plugin.searchVideos(k, 1)
        if (flag !== uuid.value) return;
        current.value += 1;
        if (!res.data || res.data.length === 0) return;
        res.data.forEach(item => {
          const resultItem: SearchResultItem = {source, item, plugin}
          const old = searchResultMap.value.get(item.title);
          if (old) {
            // 存在
            old.results.push(resultItem);
          } else {
            searchResultMap.value.set(item.title, {
              cover: item.cover,
              title: item.title,
              remark: item.remark,
              results: [resultItem]
            })
          }
        })
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

const handleRecommendSearch = (k: string) => {
  keyword.value = k;
  openSearch();
}
</script>
<style scoped lang="less">
.home {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;

  .home-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .home-search {
    position: sticky;
    top: 1rem;
    margin: 0 auto;
    width: fit-content;
    transition: padding-top 0.3s ease-in-out;
    z-index: 1;

    .home-search-container {
      box-shadow: var(--td-shadow-2);

    }
  }

  .home-container {
    margin: 3rem 2rem;

  }
}
</style>
