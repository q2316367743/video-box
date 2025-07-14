<template>
  <div class="history-page">
    <t-tabs v-model="activeKey">
      <t-tab-panel label="云盘" value="disk"></t-tab-panel>
      <t-tab-panel label="网络资源" value="web"></t-tab-panel>
      <t-tab-panel label="直播" value="tv"></t-tab-panel>
    </t-tabs>
    <div class="history-content">
      <t-list :split="true">
        <t-list-item v-for="item in items" :key="item.id">
          <t-list-item-meta :image="item.cover" :title="item.title" :description="item.subtitle"/>
        </t-list-item>
      </t-list>
      <empty-result v-if="items.length == 0" title="空空如也"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {usePlayHistoryStore} from "@/store/db/PlayHistoryStore.ts";

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
  }
}
</style>
