<template>
  <t-base-table :data="items" :loading="loading" :columns="columns" @refresh="onRefresh" row-key="path"
                height="calc(100vh - 76px)"
                @contextmenu="handleDirContextmenu({sourceId, item:current!, e:$event, onRefresh})"/>
</template>
<script lang="ts" setup>
import {BaseTableCol, Link} from "tdesign-vue-next";
import {DirItem, pluginDiskList} from "@/apis/plugin/disk/list.ts";
import {prettyDataUnit, toDateTimeString} from "@/utils/lang/FormatUtil.ts";
import {DiskInfoInstance, diskInfoKey} from "@/pages/disk/info/constants.ts";
import {handleDirItemContextmenu} from "@/pages/disk/info/dialog/DirItemContextmenu.tsx";
import {handleDirContextmenu} from "@/pages/disk/info/dialog/DirContextmenu.tsx";

const props = defineProps({
  current: {
    type: Object as PropType<DirItem>,
  },
  sourceId: {
    type: String,
    default: ''
  }
});

const diskInfo = inject<DiskInfoInstance>(diskInfoKey);

const items = ref<Array<DirItem>>([]);
const loading = ref(false);
const columns: Array<BaseTableCol> = [{
  title: '名称',
  colKey: 'name',
  width: '70%',
  cell: (h, p) => h(Link, {
    onClick: () => {
      diskInfo?.setPath(p.row as any)
    },
    onContextmenu: (e: MouseEvent) => {
      handleDirItemContextmenu(props.sourceId, p.row as any, e, () => onRefresh(true))
    }
  }, p.row.name)
}, {
  title: '文件大小',
  colKey: 'size',
  width: '15%',
  cell: (h, p) => {
    return h('span', {}, p.row.type === 'file' ? prettyDataUnit(p.row.size) : '-')
  }
}, {
  title: '更新时间',
  colKey: 'lastModified',
  width: '15%',
  cell: (h, p) => h('span', {}, toDateTimeString(p.row.lastModified))
}]

const onRefresh = async (refresh: boolean) => {
  if (loading.value) return;
  loading.value = true;
  try {
    console.log(props.current)
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
<style scoped lang="less">

</style>
