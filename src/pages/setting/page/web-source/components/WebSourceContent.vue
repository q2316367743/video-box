<template>
  <div class="web-list-content" ref="web-list-content">
    <web-source-item v-for="view in views" :key="view.id" :view="view" @click="openInfo(view)"
                     @contextmenu.stop="handleItemContextmenu($event, view, openInfo, init)"/>
    <web-source-add v-if="folder === '0'" @click="handleListContextmenu($event, init)"/>
  </div>

</template>
<script lang="ts" setup>
import {useSortable} from "@vueuse/integrations/useSortable";
import {handleItemContextmenu, handleListContextmenu} from "@/pages/web/pages/list/components/WebListContext.js";
import {WebItemView} from "@/views/WebItemView.js";
import {sourceWebHome, sourceWebSort} from "@/apis/source/web.js";
import {openWebFolderDialog} from "@/pages/setting/page/web-source/components/WebFolder.js";
import WebSourceAdd from "@/pages/setting/page/web-source/components/WebSourceAdd.vue";
import WebSourceItem from "@/pages/setting/page/web-source/components/WebSourceItem.vue";
import {router} from "@/plugin/router.js";


const props = defineProps({
  folder: {
    type: String,
    default: '0'
  }
});
const emit = defineEmits(['choose']);

const views = ref(new Array<WebItemView>());

const contentRef = useTemplateRef('web-list-content');
useSortable(contentRef, views, {
  animation: 150,
  handle: '.web-list-item',
  filter: '.web-list-add',
  onUpdate(e) {
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
});

const openInfo = (view: WebItemView) => {
  if (view.folder) {
    openWebFolderDialog(view)
  } else {
    router.push(`/web/info/${view.id}`)
  }
  emit('choose')
}

const init = () => {
  sourceWebHome(props.folder).then(res => views.value = res.sort((a, b) => a.order - b.order));
}

onMounted(init);
defineExpose({init});
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
