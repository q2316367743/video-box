<template>
  <t-dialog v-model:visible="visible" placement="center" :footer="false" :close-btn="false" :draggable="true">
    <template #header>
      <div class="text-center w-full">{{ name }}</div>
    </template>
    <div class="web-list-content" ref="web-list-content">
      <web-list-item v-for="view in views" :key="view.id" :view="view" @click="openInfo(view)"
                     @contextmenu.stop="handleItemContextmenu($event, view, openInfo)"/>
    </div>
  </t-dialog>
</template>
<script lang="ts" setup>
import {useSortable} from "@vueuse/integrations/useSortable";
import {WebItemFolder, WebItemView} from "@/pages/web/pages/list/types/WebItem.js";
import {handleItemContextmenu} from "@/pages/web/pages/list/components/WebListContext.js";
import {useVideoSourceStore, useWebFolderStore} from "@/store/index.js";
import WebListItem from "@/pages/web/pages/list/components/WebListItem.vue";

const router = useRouter();

const visible = defineModel({
  type: Boolean,
  default: false
});
const props = defineProps({
  folder: {
    type: Object as PropType<WebItemFolder | null>,
    default: null
  }
});
const name = computed(() => props.folder?.name || '');
const views = computed(() => props.folder?.children || []);

const openInfo = (view: WebItemView) => {
  router.push(`/web/info/${view.id}`)
}


const contentRef = useTemplateRef('web-list-content');
useSortable(contentRef, views, {
  animation: 150,
  handle: '.web-list-item',
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
.web-list-content {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: flex-start;
  gap: 8px;
  padding: 8px;
}
</style>
