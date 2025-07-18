<template>
  <page-layout title="网络资源">
    <div class="web-list" @contextmenu="handleListContextmenu($event)">
      <div class="web-list-content" ref="web-list-content">
        <web-list-item v-for="view in views" :key="view.id" :view="view" @click="openInfo(view)"
                       @contextmenu.stop="handleItemContextmenu($event, view, openInfo)"/>
        <web-list-add @click="handleListContextmenu($event)"/>
      </div>
    </div>
    <t-back-top container=".web-list"/>
    <web-folder v-model="model.visible" :folder="model.folder"/>
  </page-layout>
</template>
<script lang="ts" setup>
import {useSortable} from "@vueuse/integrations/useSortable";
import {useVideoSourceStore, useWebFolderStore} from "@/store";
import {Folder} from "@/entities/Folder.js";
import {buildWebItemViews, WebItemFolder, WebItemView} from "@/pages/web/pages/list/types/WebItem";
import {handleItemContextmenu, handleListContextmenu} from "@/pages/web/pages/list/components/WebListContext";
import WebListItem from "@/pages/web/pages/list/components/WebListItem.vue";
import WebListAdd from "@/pages/web/pages/list/components/WebListAdd.vue";
import WebFolder from "@/pages/web/pages/list/components/WebFolder.vue";

const router = useRouter();

const model = ref({
  visible: false,
  folder: null as WebItemFolder | null
})

const folder = computed<Array<Folder>>(() => useWebFolderStore().webFolders);
const sources = computed(() => useVideoSourceStore().sources);

const views = computed(() => buildWebItemViews(folder.value, sources.value));

const openInfo = (view: WebItemView) => {
  if (view.type === 'file') {
    router.push(`/web/info/${view.id}`)
  } else {
    model.value = {
      visible: true,
      folder: view
    }
  }
}

const contentRef = useTemplateRef('web-list-content');
useSortable(contentRef, views, {
  animation: 150,
  handle: '.web-list-item',
  filter: '.web-list-add',
  onUpdate: (e) => {
    const temp = Array.from(views.value);
    // 移动数组。将e.oldIndex!位置移动到e.newIndex!
    if (e.oldIndex === e.newIndex) {
      return;
    }
    // 从原位置移除元素
    const [movedItem] = temp.splice(e.oldIndex!, 1);
    // 将元素插入到新位置
    temp.splice(e.newIndex!, 0, movedItem);
    // 修改
    temp.forEach((item, order) => {
      if (item.type === 'file') {
        useVideoSourceStore().update({
          id: item.id,
          order: order
        })
      } else {
        useWebFolderStore().sort(item.id, order);
      }
    })
  }
});
</script>
<style scoped lang="less">
.web-list {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--td-bg-color-container);
  overflow: auto;

  .web-list-content {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: flex-start;
    gap: 8px;
    padding: 8px;
  }
}

</style>
