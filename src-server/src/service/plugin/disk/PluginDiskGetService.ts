import {DiskPlugin} from "@/modules/disk/DiskPlugin";
import {SourceDiskDir} from "@/types/SourceDiskDIr";
import {sourceDiskDirDao} from "@/dao";
import {diskBuildCache} from "@/service/plugin/disk/index";

/**
 * 获取一个目录项
 * @param path
 * @param plugin
 * @param id
 */
export async function pluginDiskGet(path: string, plugin: DiskPlugin, id: string): Promise<SourceDiskDir | null> {
// 获取缓存
  const cache = await sourceDiskDirDao.getFromPath(path, id);
  if (cache) return cache;
  const items = await diskBuildCache(path, plugin, id);
  for (let item of items) {
    if (item.path === path) {
      // 确实存在
      const cache = await sourceDiskDirDao.getFromPath(path, id);
      if (cache) return cache;
    }
  }
  return null;
}