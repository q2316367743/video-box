<template>
  <div class="my-video-item" @click="handleClick(item)" @contextmenu="handleContextmenu($event, item)">
    <img
      :src="item.cover"
      :alt="item.title"
      class="w-120px h-160px object-cover"
    />
    <div class="video-item__title ellipsis">{{ item.title }}</div>
    <div class="video-item__subtitle">{{ item.description }}</div>
  </div>
</template>
<script lang="ts" setup>
import CtxMenu from "@imengyu/vue3-context-menu";
import {isDark} from "@/store";
import {DeleteIcon, InfoCircleIcon} from "tdesign-icons-vue-next";
import MessageBoxUtil from "@/utils/modal/MessageBoxUtil";
import MessageUtil from "@/utils/modal/MessageUtil";
import {openVideoInfoDrawer} from "@/pages/web/pages/components/VideoInfoDialog";
import {openWebPlayer} from "@/plugin/player";
import {MyVideoItemFromEnum, MyVideoItemTypeEnum, MyVideoItemView} from "@/views/MyVideoItemView";
import {myVideoItemDelete, myVideoItemPost} from "@/apis/my/video-item";

defineProps({
  item: {
    type: Object as PropType<MyVideoItemView>,
    required: true
  },
  type: {
    type: String,
    required: true
  }
});
const emit = defineEmits(['update']);

const handleClick = async (item: MyVideoItemView) => {
  const [sourceId, videoId] = item.payload.split('/');
  await myVideoItemPost({
    title: item.title,
    cover: item.cover,
    description: item.description,
    type: MyVideoItemTypeEnum.WATCHED,
    from: MyVideoItemFromEnum.WEB,
    payload: `${sourceId}/${videoId}`
  })
  openWebPlayer(sourceId, videoId);
}

const handleContextmenu = (e: MouseEvent, item: MyVideoItemView) => {
  e.preventDefault();
  e.stopPropagation();
  CtxMenu.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'mac dark' : 'mac',
    items: [{
      label: '查看详情',
      icon: () => h(InfoCircleIcon, {}),
      onClick() {
        const [sourceId, videoId] = item.payload.split('/');
        openVideoInfoDrawer(sourceId, videoId);
      }
    }, {
      label: () => h('span', {style: {color: 'var(--td-error-color)'}}, '删除'),
      icon: () => h(DeleteIcon, {style: {color: 'var(--td-error-color)'}}),
      onClick() {
        MessageBoxUtil.confirm("是否删除此记录", "删除记录", {
          confirmButtonText: '删除'
        }).then(() => myVideoItemDelete(item.id)
          .then(() => {
            emit('update')
            MessageUtil.success("删除成功");
          }));
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
