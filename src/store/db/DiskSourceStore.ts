import {defineStore} from "pinia";
import {DiskDriver, DiskSource, DiskSourceForm} from "@/entities/disk/DiskSource.js";
import {
  getFromOneByAsync,
  listByAsync,
  removeOneByAsync,
  saveListByAsync,
  saveOneByAsync
} from "@/utils/utools/DbStorageUtil.js";
import {LocalNameEnum} from "@/global/LocalNameEnum.js";
import {useSnowflake} from "@/hooks/Snowflake.js";
import {DiskEntry, DiskInfo} from "@/entities/disk/DiskEntry.js";
import {refreshDiskEntry} from "@/modules/disk/index.js";

export const useDiskSourceStore = defineStore('disk-source-store', () => {
  const diskSourceList = ref<Array<DiskSource<DiskDriver>>>([]);
  const rev = ref<string>();
  // 云盘实体类缓存
  const diskEntryMap = new Map<string, DiskEntry>();
  // 正在刷新中的云盘源，源ID=>百分比
  const refreshSourceMap = ref(new Map<string, number>());
  const allowDelete = computed(() => refreshSourceMap.value.size === 0);

  listByAsync(LocalNameEnum.LIST_SOURCE_DISK).then(res => {
    diskSourceList.value = res.list;
    rev.value = res.rev;
  }).catch(e => console.error("初始化云盘源失败", e));

  const add = async (res: DiskSourceForm<DiskDriver>) => {
    const data: DiskSource<DiskDriver> = {
      ...res,
      id: useSnowflake().nextId(),
      createTime: Date.now(),
      refreshTime: 0,
      programCount: 0
    };
    diskSourceList.value.push(data);
    rev.value = await saveListByAsync(LocalNameEnum.LIST_SOURCE_DISK, diskSourceList.value, rev.value);
    await saveOneByAsync(LocalNameEnum.ITEM_SOURCE_DISK + data.id, {
      id: data.id,
      programs: []
    })
  }

  const deleteById = async (id: string) => {
    const index = diskSourceList.value.findIndex(item => item.id === id);
    if (index === -1) {
      return Promise.reject(new Error("云盘源不存在"));
    }
    diskSourceList.value.splice(index, 1);
    rev.value = await saveListByAsync(LocalNameEnum.LIST_SOURCE_DISK, diskSourceList.value, rev.value);
    await removeOneByAsync(LocalNameEnum.ITEM_SOURCE_DISK + id, true);
    diskEntryMap.delete(id);
  }

  const getInfo = async (id: string): Promise<DiskInfo> => {
    const index = diskSourceList.value.findIndex(item => item.id === id);
    if (index === -1) {
      return Promise.reject(new Error("云盘源不存在"));
    }
    let entry = diskEntryMap.get(id);
    if (!entry) {
      // 查询
      const res = await getFromOneByAsync<DiskEntry>(LocalNameEnum.ITEM_SOURCE_DISK + id)
      if (res.record) {
        entry = res.record;
      } else {
        entry = {
          id,
          programs: []
        }
      }
      // 保存到磁盘
      diskEntryMap.set(id, entry);
    }
    return {
      ...diskSourceList.value[index],
      ...entry
    }
  }

  const refreshDiskSource = async (id: string) => {
    // 判断是否正在刷新
    if (refreshSourceMap.value.has(id)) return Promise.reject(new Error("正在刷新中"));
    const index = diskSourceList.value.findIndex(item => item.id === id);
    if (index === -1) {
      return Promise.reject(new Error("云盘源不存在"));
    }
    refreshSourceMap.value.set(id, 0);
    // 刷新数据操作
    const entry = await refreshDiskEntry(diskSourceList.value[index], refreshSourceMap.value);
    // 保存到数据库
    await saveOneByAsync(LocalNameEnum.ITEM_SOURCE_DISK + id, entry);
    diskSourceList.value[index] = {
      ...diskSourceList.value[index],
      programCount: entry.programs.length,
      refreshTime: Date.now(),
    }
    // 保存到磁盘
    rev.value = await saveListByAsync(LocalNameEnum.LIST_SOURCE_DISK, diskSourceList.value, rev.value);
    // 刷新缓存
    diskEntryMap.set(id, entry);
    // 完成后删除正在刷新的标记
    refreshSourceMap.value.delete(id);
  }

  return {
    diskSourceList, refreshSourceMap, allowDelete,
    add, deleteById, getInfo, refreshDiskSource
  }

})