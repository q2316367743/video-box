<template>
  <div class="web-list-content" >
    <t-row :gutter="[16,16]" ref="web-list-content">
      <t-col v-for="view in views" :key="view.id" :span="4">
        <web-list-item :view="view"/>
      </t-col>
    </t-row>
  </div>
</template>
<script lang="ts" setup>
import {WebItemView} from "@/views/WebItemView.js";
import {sourceWebHome, sourceWebSort} from "@/apis/source/web.js";
import WebListItem from "@/pages/web/pages/list/components/WebListItem.vue";
import {useSortable} from "@vueuse/integrations/useSortable";

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
  // draggable: '.web-list-item',
  handle: '.web-list-item__move',
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

watch(() => props.folder, val => {
  sourceWebHome(val).then(res => views.value = res.sort((a, b) => a.order - b.order));
}, {immediate: true})

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
