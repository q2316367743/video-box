<template>
  <div class="plugin-disk-info">
    <t-card size="small" class="pos-sticky top-0 z-10001">
      <t-breadcrumb :options="options" :max-items="5" :items-before-collapse="3" :items-after-collapse="3"/>
    </t-card>
    <folder-view v-if="root" :source-id="sourceId" :current="root"/>
  </div>
</template>
<script lang="ts" setup>
import {TdBreadcrumbItemProps} from 'tdesign-vue-next';
import {DirItem, pluginDiskGet} from "@/apis/plugin/disk/list.ts";
import {
  HomeIcon,
} from "tdesign-icons-vue-next";
import {sourceDiskInfo} from "@/apis/source/disk.ts";
import {DiskSourceEntry} from "@/types/SourceDisk.ts";
import FolderView from "@/pages/disk/info/components/FolderView.vue";
import {DiskInfoInstance, diskInfoKey} from "@/pages/disk/info/constants.ts";

const route = useRoute();
const router = useRouter();

const sourceId = route.params.id as string;
const source = ref<DiskSourceEntry>();
const current = ref<DirItem>();
const root = ref<DirItem>();

// route.query.path as string || '/'
const options = computed<Array<TdBreadcrumbItemProps>>(() => {
  const o: Array<TdBreadcrumbItemProps> = [
    {
      icon: () => h(HomeIcon),
      content: '首页',
      onClick: () => router.push('/disk/list')
    },
    {
      content: source.value?.title || '网盘',
      onClick: () => handlePath('/')
    }];
  if (!current.value) return o;
  const a = current.value.path.split('/').filter(it => it.length > 0);
  a.forEach((p, i) => {
    o.push({
      content: p,
      onClick: () => {
        handlePath('/' + a.slice(0, i + 1).join('/'));
      }
    });
  });
  return o;
});

const handleClick = async (item: DirItem) => {
  current.value = item;
  await router.replace({
    query: {
      path: item.path
    }
  });
  const target = document.querySelector('.folder-view-content');
  if (target) {
    target.scrollTo({
      top: 0,
      behavior: 'smooth',
      left: target.clientWidth
    })
  }
};

const handlePath = (path: string) => {
  pluginDiskGet(sourceId, {path: path, password: ''}).then(handleClick);
}
const handleRefresh = (refresh: boolean) => {
  if (!current.value) return;
  // 刷新
}


let dragPath: string | undefined = undefined;
provide<DiskInfoInstance>(diskInfoKey, {
  setPath: handleClick,
  current,
  setDragPath: (path: string) => {
    dragPath = path;
  },
  getDragPath: () => {
    return dragPath;
  },
})

onMounted(() => {
  // 获取源信息
  sourceDiskInfo(sourceId).then(res => source.value = res);
  // 获取数据
  pluginDiskGet(sourceId, {path: '/', password: ''}).then(r => {
    root.value = r;
  });
});
</script>
<style scoped lang="less">
.plugin-disk-info {
  margin: 8px;

  .path {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
}
</style>
