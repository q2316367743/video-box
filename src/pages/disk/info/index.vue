<template>
  <div class="plugin-disk-info">
    <div class="path">
      <t-breadcrumb :options="options"/>
    </div>
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
  </div>
</template>
<script lang="ts" setup>
import {TdBreadcrumbItemProps} from 'tdesign-vue-next';
import {DirItem, pluginDiskReadDir} from "@/apis/plugin/disk/readDir.ts";
import {FileIcon, FolderIcon} from "tdesign-icons-vue-next";
import {openDiskFile} from "@/pages/disk/info/preview";
import MessageUtil from "@/utils/modal/MessageUtil.ts";

const route = useRoute();
const router = useRouter();

const sourceId = route.params.id as string;
const path = ref<string>(route.query.path as string || '/');
const options = computed<Array<TdBreadcrumbItemProps>>(() => {
  const o: Array<TdBreadcrumbItemProps> = [
    {
      content: '根目录',
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
  }else if (item.type === 'file') {
    openDiskFile(sourceId, item);
  }else {
    MessageUtil.error("文件未知")
  }
};

watch(path, val => {
  if (loading.value) return;
  loading.value = true;
  router.replace({
    query: {
      path: val
    }
  })
  pluginDiskReadDir(sourceId, val).then(res => {
    items.value = res;
  }).finally(() => loading.value = false)
}, {immediate: true})
</script>
<style scoped lang="less">
.plugin-disk-info {
  margin-top: 16px;

  .path {
    padding: 8px;
    border: 1px solid var(--td-border-level-2-color);
    border-radius: var(--td-radius-default);
  }
}
</style>
