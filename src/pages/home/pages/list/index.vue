<template>
  <div class="home">
    <div class="home-content">
      <div class="home-search" :style="{paddingTop: isSearch ? '1rem': '6rem'}">
        <div class="home-search-container">
          <t-input-adornment>
            <template #prepend>
              <folder-select v-model="folder" size="large" style="width: 96px"/>
            </template>
            <t-input v-model="keyword" placeholder="请输入资源名，回车搜索" clearable size="large" @enter="openSearch"
                     @clear="openSearch" style="width: 40vw;min-width: 350px;max-width: 550px;"/>
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
        <t-alert v-if="loading && isSearch" close @close="handleStop">正在搜索「{{ current }} / {{ total }}」</t-alert>
        <search-item v-for="item in searchResults" :key="item.title" :item="item"/>
        <home-recommend v-show="!isSearch" @search="handleRecommendSearch"/>
      </div>
    </div>
    <t-back-top container=".home"/>
  </div>
</template>
<script lang="ts" setup>
import {uid} from "radash";
import {SearchIcon} from "tdesign-icons-vue-next";
import MessageUtil from "@/utils/modal/MessageUtil.js";
import {SearchResult, SearchResultItem} from "@/pages/home/types/SearchResult.js";
import SearchItem from "@/pages/home/components/SearchItem.vue";
import HomeRecommend from "@/pages/home/components/HomeRecommend.vue";
import {sourceWebList} from "@/apis/source/web.js";
import {pluginWebSearch} from "@/apis/plugin-web/index.js";

const route = useRoute();

const folder = ref('all');
const keyword = ref('');
const isSearch = ref(false)

const searchResultMap = ref(new Map<string, SearchResult>());
const uuid = ref('');
const loading = ref(false);

const total = ref(0);
const current = ref(1);

const searchResults = computed(() => Array.from(searchResultMap.value.values()).sort((a, b) => (b.results.length - a.results.length)));

const openSearch = async () => {
  isSearch.value = keyword.value !== '';
  searchResultMap.value.clear();
  if (!isSearch.value) {
    return handleStop();
  }
  const flag = uid(8);
  const k = keyword.value;
  uuid.value = flag;
  try {
    loading.value = true;
    const temps = await sourceWebList(folder.value);

    total.value = temps.length;
    current.value = 1;

    await Promise.all(temps.map(async source => {
      try {
        const res = await pluginWebSearch(source.id, k, 1)
        if (flag !== uuid.value) return;
        current.value += 1;
        if (!res.data || res.data.length === 0) return;
        res.data.forEach(item => {
          const resultItem: SearchResultItem = {source, item}
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
    if (flag === uuid.value) {
      MessageUtil.error("搜索失败", e);
    }
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

onMounted(() => {
  const {keyword} = route.query;
  if (keyword) {
    handleRecommendSearch(`${keyword}`)
  }
})
</script>
<style scoped lang="less">
.home {

  .home-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .home-search {
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
