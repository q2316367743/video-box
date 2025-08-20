<template>
  <div class="news">
    <NewSourceView v-for="item in list" :key="item.id" :source="item"/>
  </div>
</template>
<script lang="ts" setup>
import { pluginNewsList } from '@/apis/plugin/news';
import { SourceNewsItem } from '@/types/SourceNews';
import NewSourceView from './components/NewSourceView.vue';


const list = ref(new Array<SourceNewsItem>());

onMounted(() => {
  pluginNewsList().then((res) => {
    console.log(res);
    list.value = res;
  });
})
</script>
<style scoped lang="less">
.news {
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  padding: 8px;
  overflow: auto;
  display: flex;
  justify-content: flex-start;
  gap: 8px;
  align-items: flex-start;
  align-content: flex-start;
}
</style>