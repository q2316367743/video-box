<template>
  <page-layout title="网盘">
    <div class="disk-list">
      <div class="disk-list-content">
        <div class="flex flex-col gap-8px p-8px" v-if="disks.length > 0">
          <t-card v-for="disk in disks" :key="disk.id">
            <div class="flex justify-between items-center">
              <t-space size="small">
                <t-link theme="primary" class="text-lg ml-8px" @click="handleDiskClick(disk)">
                  <template #prefix-icon>
                    <video-library-icon/>
                  </template>
                  {{ disk.title }}
                </t-link>
                <t-tag theme="primary" variant="outline">
                  <template #icon>
                    <time-icon/>
                  </template>
                  {{ disk.refreshTime }}
                </t-tag>
                <t-tag theme="primary" variant="outline">
                  <template #icon>
                    <file-icon/>
                  </template>
                  {{ disk.programCount }}
                </t-tag>
              </t-space>
              <t-space size="small">
                <t-button theme="primary" variant="text" shape="square" :loading="!allowDelete"
                          @click="handleDiskRefresh(disk)">
                  <template #icon>
                    <refresh-icon/>
                  </template>
                </t-button>
                <t-button theme="danger" variant="text" shape="square" :disabled="!allowDelete">
                  <template #icon>
                    <delete-icon/>
                  </template>
                </t-button>
              </t-space>
            </div>
          </t-card>
        </div>
        <empty-result v-else title="暂无网盘" tip="请先添加网盘"/>
      </div>
      <div class="add-disk-btn">
        <t-button theme="primary" shape="circle" size="large" @click="openAddDiskDialog">
          <template #icon>
            <plus-icon/>
          </template>
        </t-button>
      </div>
    </div>
  </page-layout>
</template>
<script lang="ts" setup>
import {useDiskSourceStore} from "@/store/db/DiskSourceStore";
import {DeleteIcon, FileIcon, PlusIcon, RefreshIcon, TimeIcon, VideoLibraryIcon} from "tdesign-icons-vue-next";
import {openAddDiskDialog} from "@/pages/disk/pages/list/dialog/AddDiskDialog";
import {DiskDriver, DiskSource} from "@/entities/disk/DiskSource";

const router = useRouter();

const disks = computed(() => useDiskSourceStore().diskSourceList);
const allowDelete = computed(() => useDiskSourceStore().allowDelete);

const handleDiskRefresh = (disk: DiskSource<DiskDriver>) => {
  useDiskSourceStore().refreshDiskSource(disk.id);
}
const handleDiskClick = (disk: DiskSource<DiskDriver>) => {
  router.push(`/disk/info/${disk.id}`);
}
</script>
<style scoped lang="less">
.disk-list {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  .disk-list-content {
    width: 100%;
    height: 100%;
    overflow-y: auto
  }

  .add-disk-btn {
    position: absolute;
    right: 16px;
    bottom: 16px;
  }
}
</style>
