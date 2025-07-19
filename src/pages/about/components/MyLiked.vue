<template>
  <empty-result v-if="liked.length === 0" title="空空如也"/>
  <div class="p-4 my-liked">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="item in liked" :key="item.id" class="border rounded-lg overflow-hidden cursor-pointer">
        <img
          :src="item.cover"
          :alt="item.title"
          class="w-full h-40 object-cover"
        />
        <div class="p-2">
          <div class="font-medium truncate">{{ item.title }}</div>
          <div class="text-sm text-gray-500">{{ item.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {useMyVideoItemStore} from "@/store/db/MyVideoItemStore.js";

const liked = computed(() => useMyVideoItemStore().playHistoryItems
  .filter(e => e.type === 'liked')
  .sort((a, b) => b.createTime - a.createTime));
</script>
<style scoped lang="less">

</style>
