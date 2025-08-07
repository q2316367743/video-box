<template>
  <div class="plugin-disk-info">
    <t-card size="small" class="pos-sticky top-0 z-10001">
      <div class="flex justify-between items-center">
        <t-breadcrumb :options="options" :max-items="5" :items-before-collapse="3" :items-after-collapse="3"/>
        <t-space size="small">
          <t-radio-group v-model="view" variant="primary-filled">
            <t-tooltip content="树">
              <t-radio-button value="tree">
                <tree-square-dot-vertical-icon/>
              </t-radio-button>
            </t-tooltip>
            <t-tooltip content="表格">
              <t-radio-button value="table">
                <table-icon/>
              </t-radio-button>
            </t-tooltip>
            <t-tooltip content="网格">
              <t-radio-button value="grid">
                <app-icon/>
              </t-radio-button>
            </t-tooltip>
          </t-radio-group>
          <t-dropdown trigger="click" placement="bottom-right">
            <t-button theme="primary" variant="text" shape="square">
              <template #icon>
                <filter-sort-icon/>
              </template>
            </t-button>
            <t-dropdown-menu>
              <t-dropdown-item @click="sortType = 'name'">
                <template #prefix-icon>
                  <check-icon v-if="sortType === 'name'"/>
                  <div class="w-16px" v-else/>
                </template>
                文件名
              </t-dropdown-item>
              <t-dropdown-item @click="sortType = 'size'">
                <template #prefix-icon>
                  <check-icon v-if="sortType === 'size'"/>
                  <div class="w-16px" v-else/>
                </template>
                文件大小
              </t-dropdown-item>
              <t-dropdown-item @click="sortType = 'lastModified'">
                <template #prefix-icon>
                  <check-icon v-if="sortType === 'lastModified'"/>
                  <div class="w-16px" v-else/>
                </template>
                时间
              </t-dropdown-item>
              <t-dropdown-item @click="sortType = 'type'">
                <template #prefix-icon>
                  <check-icon v-if="sortType === 'type'"/>
                  <div class="w-16px" v-else/>
                </template>
                文件类型
              </t-dropdown-item>
              <t-dropdown-item divider @click="sortType = 'extname'">
                <template #prefix-icon>
                  <check-icon v-if="sortType === 'extname'"/>
                  <div class="w-16px" v-else/>
                </template>
                拓展名
              </t-dropdown-item>
              <t-dropdown-item @click="orderType = 'asc'">
                <template #prefix-icon>
                  <check-icon v-if="orderType === 'asc'"/>
                  <div class="w-16px" v-else/>
                </template>
                正序
              </t-dropdown-item>
              <t-dropdown-item @click="orderType = 'desc'">
                <template #prefix-icon>
                  <check-icon v-if="orderType === 'desc'"/>
                  <div class="w-16px" v-else/>
                </template>
                倒序
              </t-dropdown-item>
            </t-dropdown-menu>
          </t-dropdown>
        </t-space>
      </div>
    </t-card>
    <folder-view v-if="root" :source-id="sourceId" :current :root :view/>
  </div>
</template>
<script lang="ts" setup>
import {TdBreadcrumbItemProps} from 'tdesign-vue-next';
import {DirItem, pluginDiskGet} from "@/apis/plugin/disk/list.ts";
import {
  AppIcon, CheckIcon,
  FilterSortIcon,
  HomeIcon, TableIcon, TreeSquareDotVerticalIcon,
} from "tdesign-icons-vue-next";
import {sourceDiskInfo} from "@/apis/source/disk.ts";
import {DiskSourceEntry} from "@/types/SourceDisk.ts";
import {DiskInfoInstance, diskInfoKey, OrderType, SortType} from "@/pages/disk/info/constants.ts";
import FolderView from "@/pages/disk/info/components/FolderView.vue";

const route = useRoute();
const router = useRouter();

const sourceId = route.params.id as string;
const source = ref<DiskSourceEntry>();
const current = ref<DirItem>();
const root = ref<DirItem>();
const view = useLocalStorage('/disk/view', 'tree');
const sortType = useLocalStorage<SortType>('/disk/sort', 'name');
const orderType = useLocalStorage<OrderType>('/disk/order', 'asc');

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

let dragPath: string | undefined = undefined;
provide<DiskInfoInstance>(diskInfoKey, {
  current, sortType, orderType,
  setPath: handleClick,
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
  }).finally(() => {
    if (route.query.path !== '/') {
      pluginDiskGet(sourceId, {path: route.query.path as string, password: ''}).then(r => {
        current.value = r;
      });
    } else {
      current.value = root.value
    }
  })
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
