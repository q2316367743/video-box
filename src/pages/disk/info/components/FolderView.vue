<template>
  <t-card class="mt-8px" size="small">
    <div class="flex justify-between">
      <t-space>
        <t-button theme="primary">
          <template #icon>
            <upload-icon/>
          </template>
          上传文件
        </t-button>
        <t-button theme="primary" variant="outline">
          <template #icon>
            <folder-add-icon/>
          </template>
          新建文件夹
        </t-button>
      </t-space>
      <t-space>
        <t-button theme="primary" variant="text" shape="square">
          <template #icon>
            <filter-sort-icon/>
          </template>
        </t-button>
        <t-radio-group v-model="view" variant="default-filled">
          <t-radio-button value="list">
            <view-list-icon/>
          </t-radio-button>
          <t-radio-button value="module">
            <view-module-icon/>
          </t-radio-button>
        </t-radio-group>
      </t-space>
    </div>
  </t-card>
  <t-card class="mt-8px" size="small">
    <t-list split>
      <t-list-item v-for="item in items" :key="item.path" class="folder-item" @click="handleClick(item)"
                   @contextmenu="handleContextmenu(item, $event)">
        <t-row :gutter="8" class="w-full">
          <t-col :sm="8" :xs="12">
            <div class="flex gap-8px items-center">
              <div>
                <folder-icon v-if="item.type === 'folder'"/>
                <file-icon v-else-if="item.type === 'file'"/>
              </div>
              <span>{{ item.name }}</span>
            </div>
          </t-col>
          <t-col :sm="1" :xs="0">
            {{ item.size ? prettyDataUnit(item.size) : '-' }}
          </t-col>
          <t-col :sm="3" :xs="0">
            <div class="w-full text-right">
              {{ item.lastModified ? (item.lastModified) : '-' }}
            </div>
          </t-col>
        </t-row>
      </t-list-item>
    </t-list>
    <empty-result v-if="items.length === 0" title="空空如也" tip="当前目录没有数据，可以尝试刷新强制清除缓存"/>
  </t-card>
</template>
<script lang="ts" setup>
import {
  FileIcon,
  FilterSortIcon,
  FolderAddIcon,
  FolderIcon,
  UploadIcon,
  ViewListIcon,
  ViewModuleIcon
} from "tdesign-icons-vue-next";
import {DirItem} from "@/apis/plugin/disk/list.ts";
import {prettyDataUnit} from "@/utils/lang/FormatUtil.ts";
import {handleDirItemContextmenu} from "@/pages/disk/info/dialog/DirItemContextmenu.tsx";

const props = defineProps({
  items: {
    type: Object as PropType<Array<DirItem>>,
    default: () => []
  },
  sourceId: {
    type: String,
    default: ''
  }
});
const emit = defineEmits(['update', 'refresh']);

const view = ref('list')


const handleClick = (item: DirItem) => {
  emit('update', item);
};
const handleContextmenu = (item: DirItem, e: MouseEvent) => {
  handleDirItemContextmenu(props.sourceId, item, e, () => emit('refresh'));
}
</script>
<style scoped lang="less">
.folder-item {
  border-radius: var(--td-radius-medium);
  transition: all 0.3s ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: var(--td-bg-color-container-hover);
  }
}
</style>
