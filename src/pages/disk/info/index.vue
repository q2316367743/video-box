<template>
  <div class="plugin-disk-info">
    <t-card size="small" class="pos-sticky top-0 z-10001">
      <div class="path">
        <t-breadcrumb :options="options" :max-items="5" :items-before-collapse="3" :items-after-collapse="3"/>
        <t-button theme="primary" variant="text" shape="square" size="small" @click="handleRefresh(true)"
                  :disabled="!current">
          <template #icon>
            <refresh-icon/>
          </template>
        </t-button>
      </div>
    </t-card>
    <t-loading :loading="loading" :style="{marginBottom: readme? '8px' : '16px'}">
      <folder-view v-if="current && current.type === 'folder'" :items="items" :source-id="sourceId"
                   @update="handleClick" @refresh="handleRefresh(false)"/>
      <file-view v-else-if="current && current.type === 'file'" :item="current" :source-id="sourceId"/>
      <loading-result v-else-if="current" title="文件类型未知"/>
      <loading-result v-else title="没有文件"/>
    </t-loading>
    <!-- 可能存在的README.md -->
    <readme-view v-if="readme" :source-id="sourceId" :item="readme"/>
  </div>
</template>
<script lang="ts" setup>
import {TdBreadcrumbItemProps} from 'tdesign-vue-next';
import {DirItem, pluginDiskGet, pluginDiskList} from "@/apis/plugin/disk/list.ts";
import {
  HomeIcon,
  RefreshIcon,
} from "tdesign-icons-vue-next";
import {sourceDiskInfo} from "@/apis/source/disk.ts";
import {DiskSourceEntry} from "@/types/SourceDisk.ts";
import FolderView from "@/pages/disk/info/components/FolderView.vue";
import FileView from "@/pages/disk/info/components/FileView.vue";
import ReadmeView from "@/pages/disk/info/components/ReadmeView.vue";

const route = useRoute();
const router = useRouter();

const sourceId = route.params.id as string;
const source = ref<DiskSourceEntry>();
const items = ref<Array<DirItem>>([]);
const loading = ref(false);
const current = ref<DirItem>();

// route.query.path as string || '/'
const options = computed<Array<TdBreadcrumbItemProps>>(() => {
  const o: Array<TdBreadcrumbItemProps> = [
    {
      icon: () => h(HomeIcon),
      content: source.value?.title || '根目录',
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
const readme = computed<DirItem | undefined>(() => items.value.find(e => e.name.toLocaleLowerCase() === 'readme.md'))

const handleClick = async (item: DirItem) => {
  current.value = item;
  router.replace({
    query: {
      path: item.path
    }
  })
  if (loading.value) return;
  loading.value = true;
  try {
    if (item.type === 'folder') {
      // 目录
      items.value = await pluginDiskList(sourceId, {path: item.path, refresh: false})
    } else {
      items.value = [];
    }
  } finally {
    loading.value = false
  }
};

const handlePath = (path: string) => {
  pluginDiskGet(sourceId, {path: path, password: ''}).then(handleClick);
}
const handleRefresh = (refresh: boolean) => {
  if (!current.value) return;
  if (loading.value) return;
  loading.value = true;
  pluginDiskList(sourceId, {path: current.value.path, refresh}).then(res => {
    items.value = res;
  }).finally(() => loading.value = false)
}

onMounted(() => {
  // 获取源信息
  sourceDiskInfo(sourceId).then(res => source.value = res);
  // 获取数据
  handlePath(route.query.path as string || '/');
});
</script>
<style scoped lang="less">
.plugin-disk-info {
  margin-top: 8px;

  .path {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
}
</style>
