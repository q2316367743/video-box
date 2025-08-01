<template>
  <t-list split>
    <t-list-item v-for="item in items" :key="item.path">
      <div class="flex justify-start items-center gap-8px">
        <div>
          <folder-icon v-if="item.type === 'folder'"/>
          <file-icon v-else-if="item.type === 'file'"/>
        </div>
        <t-link @click="handleClick(item)">{{ item.name }}</t-link>
      </div>
    </t-list-item>
  </t-list>
  <empty-result v-if="items.length === 0" title="空空如也" tip="当前目录没有数据，可以尝试刷新强制清除缓存"/>
</template>
<script lang="ts" setup>
import {FileIcon, FolderIcon} from "tdesign-icons-vue-next";
import {DirItem} from "@/apis/plugin/disk/list.ts";

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
const emit = defineEmits(['update']);


const handleClick = (item: DirItem) => {
  emit('update', item);
};
</script>
<style scoped lang="less">

</style>
