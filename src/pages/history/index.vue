<template>
  <div class="history-page">
    <t-tabs v-model="activeKey">
      <t-tab-panel label="云盘" value="disk"></t-tab-panel>
      <t-tab-panel label="网络资源" value="web"></t-tab-panel>
      <t-tab-panel label="直播" value="tv"></t-tab-panel>
    </t-tabs>
    <div class="history-content">
      <history-item v-for="item in items" :key="item.id" :item="item"/>
    </div>
    <empty-result v-if="items.length == 0" title="空空如也"/>
  </div>
</template>
<script lang="ts" setup>
import {usePlayHistoryStore} from "@/store/db/PlayHistoryStore.ts";
import HistoryItem from "@/pages/history/components/HistoryItem.vue";

const activeKey = ref('disk');

const items = computed(() => usePlayHistoryStore().playHistoryItems.filter(e => e.type === activeKey.value));
</script>
<style scoped lang="less">
.history-page {
  width: 100%;
  height: 100%;
  position: relative;

  .history-content {
    position: absolute;
    top: 48px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
    display: flex;
    justify-content: flex-start;
    align-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    padding: 8px;
    gap: 8px;
  }
}
</style>
