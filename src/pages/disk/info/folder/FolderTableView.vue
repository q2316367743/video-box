<template>
  <t-base-table v-if="current.type === 'folder'" :data="data" :loading="loading" :columns="columns"
                @refresh="onRefresh" row-key="path"
                height="calc(100vh - 76px)" :scroll="{ type: 'virtual' }"
                @contextmenu="handleDirContextmenu({ sourceId, item: current, e: $event, onRefresh })"/>
  <file-view v-else :current="current" :source-id="sourceId"/>
</template>
<script lang="ts" setup>
import {BaseTableCol, Link} from "tdesign-vue-next";
import {DirItem, pluginDiskList} from "@/apis/plugin/disk/list.ts";
import {prettyDataUnit, toDateTimeString} from "@/utils/lang/FormatUtil.ts";
import {DiskInfoInstance, diskInfoKey, sortFunc} from "@/pages/disk/info/constants.ts";
import {handleDirItemContextmenu} from "@/pages/disk/info/dialog/DirItemContextmenu.tsx";
import {handleDirContextmenu} from "@/pages/disk/info/dialog/DirContextmenu.tsx";
import FileIconView from "@/pages/disk/info/components/FileIconView.vue";
import FileView from "@/pages/disk/info/components/FileView.vue";

const props = defineProps({
  current: {
    type: Object as PropType<DirItem>,
    required: true
  },
  sourceId: {
    type: String,
    default: ''
  }
});

const diskInfo = inject<DiskInfoInstance>(diskInfoKey);

const items = ref<Array<DirItem>>([]);
const loading = ref(false);
const columns: Array<BaseTableCol> = [
  {
    title: '名称',
    colKey: 'name',
    cell: (h, p) => h('div', {
      class: 'flex items-center'
    }, [
      h(FileIconView, {
        type: p.row.type,
        extname: p.row.extname
      }),
      h(Link, {
        onClick: () => {
          diskInfo?.setPath(p.row as any)
        },
        onContextmenu: (e: MouseEvent) => {
          handleDirItemContextmenu(props.sourceId, p.row as any, e, () => onRefresh(true))
        },
        class: 'ml-8px'
      }, () => p.row.name)
    ])
  }, {
    title: '文件大小',
    colKey: 'size',
    width: 120,
    cell: (h, p) => {
      return h('span', {}, p.row.type === 'file' ? prettyDataUnit(p.row.size) : '-')
    }
  }, {
    title: '更新时间',
    colKey: 'lastModified',
    width: 186,
    cell: (h, p) => h('span', {}, toDateTimeString(p.row.lastModified))
  }];

const data = computed(() => items.value.sort((a, b) => sortFunc(a, b, diskInfo?.sortType.value || 'name', diskInfo?.orderType.value || 'asc')));

const onRefresh = async (refresh: boolean) => {
  if (loading.value) return;
  loading.value = true;
  try {
    if (props.current?.type === 'folder') {
      items.value = [];
      items.value = await pluginDiskList(props.sourceId, {path: props.current.path, refresh})
    }
  } finally {
    loading.value = false
  }
};

watch(() => props.current, () => onRefresh(false), {immediate: true})
</script>
<style scoped lang="less"></style>
