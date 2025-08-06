import {diskBuildCache} from "@/service/plugin/disk/PluginDiskBuildCache";
import {DirItem, DiskPlugin} from "@/modules/disk/DiskPlugin";
import {sourceDiskDirDao} from "@/dao";
import {debug} from "@rasla/logify";
import {diskRefreshCache} from "@/service/plugin/disk/PluginDiskRefreshCacheService";

export async function pluginDiskListService(path: string, plugin: DiskPlugin, id: string, refresh: boolean): Promise<Array<DirItem>> {

  // 获取缓存
  debug('获取缓存')
  const parent = await sourceDiskDirDao.getFromPath(path, id);

  if (parent) {
    if (parent.cache) {
      // 父目录已缓存
      debug('父目录已缓存')
      if (refresh) {
        // 强制刷新
        debug('强制刷新')
        return diskRefreshCache(parent, plugin);
      } else {
        // 不强制刷新，使用缓存
        debug('不强制刷新，使用缓存')
        return sourceDiskDirDao.readDir(parent);
      }
    } else {
      // 没有缓存
      debug('没有缓存')
      const items = await plugin.list(parent);
      // 保存缓存
      debug('保存缓存')
      await sourceDiskDirDao.saveCache(items, id);
      // 更新当前为已刷新
      debug('更新当前为已刷新')
      await sourceDiskDirDao.updateById(parent.id, {cache: 1, update_time: Date.now()});
      return items;
    }
  } else {
    // 没有目录
    debug('没有目录')
    return diskBuildCache(path, plugin, id);
  }
}