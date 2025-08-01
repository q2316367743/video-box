<template>
  <div class="plugin-disk-info">
    <div class="path">
      <t-breadcrumb :options="options" :max-items="5" :items-before-collapse="3" :items-after-collapse="3"/>
      <t-button theme="primary" variant="text" shape="square" size="small" @click="handleRefresh()">
        <template #icon>
          <refresh-icon />
        </template>
      </t-button>
    </div>
    <t-loading :loading="loading">
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
    </t-loading>
  </div>
</template>
<script lang="ts" setup>
import {TdBreadcrumbItemProps} from 'tdesign-vue-next';
import {DirItem, pluginDiskReadDir} from "@/apis/plugin/disk/readDir.ts";
import {FileIcon, FolderIcon, HomeIcon, RefreshIcon} from "tdesign-icons-vue-next";
import {openDiskFile} from "@/pages/disk/info/preview";
import MessageUtil from "@/utils/modal/MessageUtil.ts";
import {sourceDiskInfo} from "@/apis/source/disk.ts";
import {DiskSourceEntry} from "@/types/SourceDisk.ts";

const route = useRoute();
const router = useRouter();

const sourceId = route.params.id as string;
const path = ref<string>(route.query.path as string || '/');
const source = ref<DiskSourceEntry>();
const options = computed<Array<TdBreadcrumbItemProps>>(() => {
  const o: Array<TdBreadcrumbItemProps> = [
    {
      icon: () => h(HomeIcon),
      content: source.value?.title || '根目录',
      onClick: () => {
        path.value = '/';
      }
    }];
  const a = path.value.split('/').filter(it => it.length > 0);
  a.forEach((p, i) => {
    o.push({
      content: p,
      onClick: () => {
        path.value = '/' + a.slice(0, i + 1).join('/');
      }
    });
  });
  return o;
});

const items = ref<Array<DirItem>>([]);
const loading = ref(false);

const handleClick = (item: DirItem) => {
  if (item.type === 'folder') {
    path.value = item.path;
  } else if (item.type === 'file') {
    openDiskFile(sourceId, item);
  } else {
    MessageUtil.error("文件未知")
  }
};
const handleRefresh = () => {
  if (loading.value) return;
  loading.value = true;
  pluginDiskReadDir(sourceId, {path: path.value, refresh: true}).then(res => {
    items.value = res;
  }).finally(() => loading.value = false)
}

watch(path, val => {
  if (loading.value) return;
  loading.value = true;
  router.replace({
    query: {
      path: val
    }
  })
  pluginDiskReadDir(sourceId, {path: val, refresh: false}).then(res => {
    items.value = res;
  }).finally(() => loading.value = false)
}, {immediate: true});
onMounted(() => sourceDiskInfo(sourceId).then(res => source.value = res));
</script>
<style scoped lang="less">
.plugin-disk-info {
  margin-top: 16px;

  .path {
    padding: 8px;
    border: 1px solid var(--td-border-level-2-color);
    border-radius: var(--td-radius-default);
    margin: 0 8px;
    display: flex;
    justify-content: space-between;
  }
}
</style>
