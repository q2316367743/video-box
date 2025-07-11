<template>
  <div class="home">
    <header class="home-header">
      <div class="flex gap-8px items-center">
        <t-select v-model="selectValue" :options="sourceOptions" placeholder="请选择源" class="w-120px" clearable/>
        <t-tag theme="primary" variant="outline" size="large" v-if="title" closable @close="handleCloseCw">
          <template #icon>
            <play-icon/>
          </template>
          {{ title }}
        </t-tag>
      </div>
      <t-input v-model="inputValue" placeholder="请输入影视名称" class="w-240px" clearable @enter="handleSearch"
               @clear="handleSearch" :disabled="!selectValue || loading">
        <template #prefix-icon>
          <search-icon/>
        </template>
      </t-input>
    </header>
    <div class="home-content-wrap">
      <web-category v-if="plugin" :plugin :value="categoryValue" ref="categoryRef"
                     @change-category="handleChangeCategory" v-model="loading"/>
      <empty-result v-else title="请先选择源"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {PlayIcon, SearchIcon} from "tdesign-icons-vue-next";
import {usePlayerWindowStore, useVideoSourceStore} from "@/store";
import {buildVideoPlugin} from "@/modules/video";
import {VideoPlugin} from "@/modules/video/VideoPlugin";
import WebCategory from "@/pages/web/components/WebCategory.vue";

const categoryRef = ref();
const inputValue = ref('');
const selectValue = useSessionStorage('selectValue', '');
const categoryValue = ref('');
const plugin = shallowRef<VideoPlugin | null>(null);
const loading = ref(false);

const {sourceOptions} = toRefs(useVideoSourceStore());
const {title} = toRefs(usePlayerWindowStore());

const handleCloseCw = () => {
  usePlayerWindowStore().closePlayerWindow();
}

const handleSearch = () => {
  categoryRef.value?.search(inputValue.value);
}
const handleChangeCategory = () => {
  inputValue.value = '';
}

watch(selectValue, value => {
  // 清空数据
  plugin.value = null;
  // 获取插件
  if (value) {
    const source = useVideoSourceStore().sourceMap.get(value);
    if (!source) return;  // 不存在
    nextTick(() => {
      plugin.value = buildVideoPlugin(source);
    })
  }
}, {immediate: true});
</script>
<style scoped lang="less">
.home {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: var(--td-bg-color-container);

  .home-header {
    padding: 12px 12px 11px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--td-border-level-2-color);
  }

  .home-content-wrap {
    position: absolute;
    top: 56px;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--td-bg-color-page);
    overflow-y: auto;
    overflow-x: hidden;


  }
}
</style>
