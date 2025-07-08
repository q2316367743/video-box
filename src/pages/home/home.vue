<template>
  <div class="home">
    <header class="home-header">
      <t-select v-model="selectValue" :options="sourceOptions" placeholder="请选择源" class="w-120px" clearable/>
      <t-input v-model="inputValue" placeholder="请输入影视名称" class="w-240px" clearable>
        <template #prefix-icon>
          <search-icon/>
        </template>
      </t-input>
    </header>
    <div class="home-content-wrap">
      <home-category v-if="plugin" :plugin :value="categoryValue"/>
      <empty-result v-else title="请先选择源"/>
    </div>
    <t-back-top container=".home-content-wrap"/>
  </div>
</template>
<script lang="ts" setup>
import {SearchIcon} from "tdesign-icons-vue-next";
import {useSourceStore} from "@/store";
import {buildVideoPlugin} from "@/core";
import {VideoPlugin} from "@/core/VideoPlugin";
import HomeCategory from "@/pages/home/components/HomeCategory.vue";

const inputValue = ref('');
const selectValue = useSessionStorage('selectValue', '');
const categoryValue = ref('');
const plugin = shallowRef<VideoPlugin | null>(null);

const {sourceOptions} = toRefs(useSourceStore());

watch(selectValue, value => {
  // 清空数据
  plugin.value = null;
  // 获取插件
  if (value) {
    const source = useSourceStore().sourceMap.get(value);
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
    padding: 12px;

    display: flex;
    justify-content: space-between;
    align-items: center;
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
