<template>
  <div class="web-list-content" ref="web-list-content">
    <web-list-item v-for="view in views" :key="view.id" :view="view" @click="openInfo(view)"
                   @contextmenu.stop="handleItemContextmenu($event, view, openInfo, init)"/>
  </div>

</template>
<script lang="ts" setup>
import {handleItemContextmenu} from "@/pages/web/pages/list/components/WebListContext.js";
import WebListItem from "@/pages/web/pages/list/components/WebListItem.vue";
import {WebItemView} from "@/views/WebItemView.js";
import {sourceWebHome} from "@/apis/source/web.js";
import {useSortable} from "@vueuse/integrations/useSortable";
import {openWebFolderDialog} from "@/pages/web/pages/list/components/WebFolder.js";

const router = useRouter();

const props = defineProps({
  folder: {
    type: String,
    default: '0'
  }
});

const views = ref(new Array<WebItemView>());

const contentRef = useTemplateRef('web-list-content');
useSortable(contentRef, views, {
  animation: 150,
  handle: '.web-list-item',
  filter: '.web-list-add',
});

const openInfo = (view: WebItemView) => {
  if (view.folder) {
    openWebFolderDialog(view)
  } else {
    router.push(`/web/info/${view.id}`)
  }
}

const init = () => {
  sourceWebHome(props.folder).then(res => views.value = res);
}

onMounted(init);
defineExpose({init})
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
