<template>
  <div class="web-source-folder web-source-item" :title="view.name">
    <div class="web-source-folder__info">
      <div class="web-source-folder__title">{{ view.name }}</div>
      <div class="web-source-folder__action">
        <t-space size="small">
          <t-button theme="primary" shape="square">
            <template #icon>
              <edit-icon/>
            </template>
          </t-button>
          <t-button theme="danger" shape="square">
            <template #icon>
              <delete-icon/>
            </template>
          </t-button>
        </t-space>
      </div>
    </div>
    <div class="web-source-folder__content" ref="web-source-folder">
      <web-source-item v-for="child in view.children" :key="child.id" :view="child" @update="$emit('update')"/>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {WebSourceFolderView} from "@/pages/setting/page/web-source/types/WebSourceView.js";
import WebSourceItem from "@/pages/setting/page/web-source/components/WebSourceItem.vue";
import {useSortable} from "@vueuse/integrations/useSortable";
import {sourceWebMove, sourceWebSort} from "@/apis/source/web.js";
import {SortableEvent} from "sortablejs";
import MessageUtil from "@/utils/modal/MessageUtil.js";
import {DeleteIcon, EditIcon} from "tdesign-icons-vue-next";

const props = defineProps({
  view: {
    type: Object as PropType<WebSourceFolderView>,
    required: true,
  }
});
const emit = defineEmits(['update']);
const contentRef = useTemplateRef('web-source-folder');

const onUpdate = (e: SortableEvent) => {
  const temp = Array.from(props.view.children);
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

useSortable(contentRef, props.view.children, {
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
      await sourceWebMove(id, props.view.id);
      // 排序
      onUpdate(e);
    } catch (e) {
      MessageUtil.error("移动失败", e, () => emit("update"));
    }
  }
});
</script>
<style scoped lang="less">
.web-source-folder {
  padding: 8px;
  cursor: pointer;
  transition: border 0.3s ease, background-color 0.3s ease;
  border-radius: var(--td-radius-default);
  border: 1px solid var(--td-border-level-2-color);
  background-color: var(--td-bg-color-secondarycontainer);
  width: calc(100% - 16px);
  margin-top: 8px;

  .web-source-folder__info {
    display: flex;
  }

  &:hover {
    background-color: var(--td-bg-color-secondarycontainer-hover);
  }

  &:active {
    background-color: var(--td-bg-color-secondarycontainer-active);
  }

  .web-source-folder__info {
    padding: 12px 6px;
  }

  .web-source-folder__title {
    font-weight: bold;
    font-size: var(--td-font-size-title-large);
    line-height: 32px;
  }

  .web-source-folder__action {
    margin-left: auto;
  }

  .web-source-folder__content {
    margin-top: 8px;
  }
}
</style>
