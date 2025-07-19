<template>
  <empty-result v-if="watched.length === 0" title="空空如也"/>
  <div class="p-4 my-watched">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="item in watched" :key="item.id" class="border rounded-lg overflow-hidden cursor-pointer"
           @click="handleClick(item)" @contextmenu="handleContextmenu($event, item)">
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
import {LoadingPlugin} from "tdesign-vue-next";
import CtxMenu from "@imengyu/vue3-context-menu";
import {useMyVideoItemStore} from "@/store/db/MyVideoItemStore.js";
import {MyVideoItem} from "@/entities/MyVideoItem.js";
import {isDark, usePlayerWindowStore, useVideoSourceStore} from "@/store/index.js";
import MessageUtil from "@/utils/modal/MessageUtil.js";
import {buildVideoPlugin} from "@/modules/video/index.js";
import {DeleteIcon} from "tdesign-icons-vue-next";
import MessageBoxUtil from "@/utils/modal/MessageBoxUtil.js";

const watched = computed(() => useMyVideoItemStore().playHistoryItems
  .filter(e => e.type === 'watched')
  .sort((a, b) => b.createTime - a.createTime));

const handleClick = async (item: MyVideoItem) => {
  const lp = LoadingPlugin({
    text: '正在打开',
    fullscreen: true
  });
  (async () => {
    const [sourceId, videoId] = item.payload.split('/');
    // 获取网络资源
    const source = useVideoSourceStore().sourceMap.get(sourceId);
    if (!source) return Promise.reject(new Error("资源不存在"));
    // 获取插件
    const plugin = buildVideoPlugin(source);
    if (!plugin) return Promise.reject(new Error("插件不存在"));
    const detail = await plugin.getDetail(videoId);
    // 打开
    await usePlayerWindowStore().openPlayerWindow(source, detail);
  })().catch(e => MessageUtil.error("打开失败", e))
    .finally(() => lp.hide());
}

const handleContextmenu = (e: MouseEvent, item: MyVideoItem) => {
  CtxMenu.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'dark' : 'light',
    items: [{
      label: () => h('span', {style: {color: 'var(--td-error-color)'}}, '删除'),
      icon: () => h(DeleteIcon, {style: {color: 'var(--td-error-color)'}}),
      onClick() {
        MessageBoxUtil.confirm("是否删除此历史记录", "删除历史记录", {
          confirmButtonText: '删除'
        }).then(() => useMyVideoItemStore().del(item.id)
          .then(() => MessageUtil.success("删除成功"))
          .catch(e => MessageUtil.error("删除失败", e)));
      }
    }]
  })
}
</script>
<style scoped lang="less">

</style>
