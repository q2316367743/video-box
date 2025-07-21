<template>
  <div class="my-video-item"
       @click="handleClick(item)" @contextmenu="handleContextmenu($event, item)">
    <img
      :src="item.cover"
      :alt="item.title"
      class="w-120px h-160px object-cover"
    />
    <div class="video-item__title">{{ item.title }}</div>
    <div class="video-item__subtitle">{{ item.description }}</div>
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
import {DeleteIcon, InfoCircleIcon} from "tdesign-icons-vue-next";
import MessageBoxUtil from "@/utils/modal/MessageBoxUtil.js";
import {openVideoInfoDrawer} from "@/pages/web/pages/components/VideoInfoDialog.js";

defineProps({
  item: {
    type: Object as PropType<MyVideoItem>,
    required: true
  },
  type: {
    type: String,
    required: true
  }
});

const router = useRouter();

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
    try {
      await usePlayerWindowStore().openPlayerWindow(source, {...detail, similar: []});
    } catch (e) {
      MessageUtil.error("打开失败，进行搜索", e);
      // 跳转搜索
      await router.push({
        path: '/',
        query: {
          keyword: item.title
        }
      })
    }
  })().catch(e => MessageUtil.error("打开失败", e))
    .finally(() => lp.hide());
}

const handleContextmenu = (e: MouseEvent, item: MyVideoItem) => {
  CtxMenu.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'dark' : 'light',
    items: [{
      label: '查看详情',
      icon: () => h(InfoCircleIcon, {style: {color: 'var(--td-error-color)'}}),
      onClick() {
        const [sourceId, videoId] = item.payload.split('/');
        // 获取网络资源
        const source = useVideoSourceStore().sourceMap.get(sourceId);
        if (!source) return Promise.reject(new Error("资源不存在"));
        // 获取插件
        const plugin = buildVideoPlugin(source);
        if (!plugin) return Promise.reject(new Error("插件不存在"));
        openVideoInfoDrawer(videoId, plugin);
      }
    }, {
      label: () => h('span', {style: {color: 'var(--td-error-color)'}}, '删除'),
      icon: () => h(DeleteIcon, {style: {color: 'var(--td-error-color)'}}),
      onClick() {
        MessageBoxUtil.confirm("是否删除此记录", "删除记录", {
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
.my-video-item {
  transition: all 0.3s ease-in-out;
  border-radius: var(--td-radius-medium);
  overflow: hidden;
  cursor: pointer;

  .video-item__title {
    color: var(--td-text-color-primary);
    font-size: var(--td-font-size-title-medium);
    font-weight: bold;
  }

  .video-item__subtitle {
    color: var(--td-text-color-secondary);
    font-size: var(--td-font-size-body-medium);
    margin-top: 4px;

  }
}
</style>
