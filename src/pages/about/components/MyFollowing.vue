<template>
  <empty-result v-if="following.length === 0" title="空空如也"/>
  <div class="p-4 my-following">
    <div class="space-y-4">
      <div v-for="item in following" :key="item.id" class="flex border rounded-lg p-3 cursor-pointer">
        <img
          :src="item.cover"
          :alt="item.title"
          class="w-24 h-32 object-cover rounded"
        />
        <div class="ml-4 flex-1 flex flex-col">
          <div class="font-bold text-lg mb-8px">{{ item.title }}</div>
          <div class="text-gray-600 mt-1">{{ item.description }}</div>
          <div class="mt-auto w-full">
            <t-progress :percentage="30" :label="`已看30%`"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {useMyVideoItemStore} from "@/store/db/MyVideoItemStore.js";

const following = computed(() => useMyVideoItemStore().playHistoryItems
  .filter(e => e.type === 'following')
  .sort((a, b) => b.createTime - a.createTime));
</script>
<style scoped lang="less">

</style>
