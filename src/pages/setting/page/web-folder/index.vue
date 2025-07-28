<template>
  <page-layout title="文件夹设置">
    <template #extra>
      <t-button theme="primary" @click="addFolderWeb(init)">新增</t-button>
    </template>
    <div class="web-folder-content" ref="web-folder-content">
      <div class="web-folder-item" v-for="folder in folders" :key="folder.id">
        <div class="web-folder-item__title">{{ folder.name }}</div>
        <div class="web-folder-item__actions">
          <t-space size="small">
            <t-button theme="primary" @click="updateFolderWeb(folder, init)">重命名</t-button>
            <t-popconfirm content="是否删除此资源，删除后将无法恢复" confirm-btn="删除"
                          @confirm="removeFolderWeb(folder, init)">
              <t-button theme="danger">删除</t-button>
            </t-popconfirm>
          </t-space>
        </div>
      </div>
    </div>
  </page-layout>
</template>
<script lang="ts" setup>
import {Folder} from "@/views/Folder";
import {folderWebList, folderWebSort} from "@/apis/folder-web/index";
import {useSortable} from "@vueuse/integrations/useSortable";
import {updateFolderWeb, addFolderWeb, removeFolderWeb} from "@/pages/setting/page/web-folder/components/WebFolderContext";

const folders = ref(new Array<Folder>());
const contentRef = useTemplateRef<HTMLDivElement>('web-folder-content');

useSortable(contentRef, folders, {
  animation: 150,
  handle: '.web-folder-item',
  onUpdate(e) {
    const temp = Array.from(folders.value);
    // 移动数组。将e.oldIndex!位置移动到e.newIndex!
    if (e.oldIndex === e.newIndex) {
      return;
    }
    // 从原位置移除元素
    const [movedItem] = temp.splice(e.oldIndex!, 1);
    // 将元素插入到新位置
    temp.splice(e.newIndex!, 0, movedItem);
    // 修改
    folderWebSort(temp.map((item, order) => ({
      id: item.id,
      order: order
    })))
  }
})

const init = () => folderWebList().then(res => folders.value = res.sort((a, b) => a.order - b.order));

onMounted(init);
</script>
<style scoped lang="less">
.web-folder-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;

  .web-folder-item {
    border: 1px solid var(--td-border-level-2-color);
    border-radius: var(--td-radius-medium);
    background-color: var(--td-bg-color-component);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 12px;
    transition: background-color 0.3s;

    &:hover {
      background-color: var(--td-bg-color-component-hover);
    }

    &:active {
      background-color: var(--td-bg-color-component-active);
    }

    .web-folder-item__title {
      font-size: var(--td-font-size-title-large);
      font-weight: bold;
    }
  }
}
</style>
