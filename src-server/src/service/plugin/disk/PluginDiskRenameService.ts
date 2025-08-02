import {DiskPlugin} from "@/modules/disk/DiskPlugin";
import {pluginDiskGet} from "@/service/plugin/disk/PluginDiskGetService";
import {sourceDiskDirDao} from "@/dao";
import {db} from "@/global/db";
import {diskRefreshCache} from "@/service/plugin/disk/PluginDiskRefreshCacheService";


export async function pluginDiskRename(plugin: DiskPlugin, path: string, name: string, sourceId: string) {
  // 获取目录项
  const oldDir = await pluginDiskGet(path, plugin, sourceId);
  if (!oldDir) return Promise.reject(new Error("目录项不存在"));
  // 更新存储名
  await plugin.rename(oldDir, name);
  try {
    // 更新数据库数据
    await db.exec('BEGIN');
    const folder = await sourceDiskDirDao.getFromPath(oldDir.folder, sourceId);
    if (!folder) return Promise.reject(new Error("父目录不存在"));
    // 刷新父目录
    await diskRefreshCache(folder, plugin);
    await db.exec("COMMIT");
  } catch (e) {
    await db.exec('ROLLBACK');
    // 名字改回去
    await plugin.rename(oldDir, oldDir.name);
  }

}