<template>
  <div class="web-source-content" ref="web-list-content">
    <template v-for="view in views" :key="view.id">
      <web-source-folder v-if="view.folder" :view="view" @update="init"/>
      <web-source-item v-else :view="view" @update="init"/>
    </template>
  </div>
</template>
<script lang="ts" setup>
import {SortableEvent} from "sortablejs";
import {useSortable} from "@vueuse/integrations/useSortable";
import {sourceWebMove, sourceWebSort} from "@/apis/source/web.js";
import {renderWebSourceView, WebSourceView} from "@/pages/setting/page/web-source/types/WebSourceView.js";
import {folderWebList} from "@/apis/folder-web/index.js";
import WebSourceItem from "@/pages/setting/page/web-source/components/WebSourceItem.vue";
import WebSourceFolder from "@/pages/setting/page/web-source/components/WebSourceFolder.vue";
import MessageUtil from "@/utils/modal/MessageUtil.js";
import {adminSourceWebList} from "@/apis/admin/source/web.js";

const views = ref(new Array<WebSourceView>());

const onUpdate = (e: SortableEvent) => {
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
  sourceWebSort(temp.map((item, order) => ({
    id: item.id,
    folder: item.folder,
    order: order
  })))
}

const contentRef = useTemplateRef('web-list-content');
useSortable(contentRef, views, {
  animation: 150,
  group: 'web',
  handle: '.web-source-item',
  fallbackOnBody: true,
  onUpdate,
  async onAdd(e) {
    // 先增加元素
    try {
      const {id} = (e.item as HTMLDivElement).dataset;
      if (!id) throw new Error("ID不存在");
      // 移动
      await sourceWebMove(id, '0');
      // 排序
      onUpdate(e);
    } catch (e) {
      MessageUtil.error("移动失败", e, init);
    }
  }
});

const init = () => {
  (async () => {
    const [folders, sources] = await Promise.all([folderWebList(), adminSourceWebList('all')]);
    views.value = renderWebSourceView(folders, sources);
  })().catch(console.error);
}

onMounted(init);
defineExpose({init});
</script>
<style scoped lang="less">
.web-source-content {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  align-content: flex-start;
  padding: 8px;
}
</style>
