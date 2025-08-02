import {SourceDiskDir} from "@/types/SourceDiskDIr";
import {DirItem, DiskPlugin} from "@/modules/disk/DiskPlugin";
import {debug} from "@rasla/logify";
import {sourceDiskDirDao} from "@/dao";
import {map} from "@/utils/ArrayUtil";
import dayjs from "dayjs";

/**
 * 重命名一个目录项及其子项
 * @param sourceDiskId 磁盘ID
 * @param oldPath 旧的路径
 * @param newPath 新的路径
 */
export async function renameSub(sourceDiskId: string, oldPath: string, newPath: string) {
  const update_time = Date.now();
  debug(`更新全部子路径 |「${oldPath}」=>「${newPath}」`)
  await sourceDiskDirDao.query()
    .likeRight('folder', oldPath)
    .eq('source_disk_id', sourceDiskId)
    .batchList(100, async (list) => {
      for (let e of list) {
        await sourceDiskDirDao.updateById(e.id, {
          path: replaceStart(e.path, oldPath, newPath),
          folder: replaceStart(e.folder, oldPath, newPath),
          update_time,
        });
      }
    });
}

/**
 * 刷新缓存并返回当前目录下的所有文件
 * @param parent 需要刷新的目录
 * @param plugin 插件
 */
export async function diskRefreshCache(parent: SourceDiskDir, plugin: DiskPlugin): Promise<Array<DirItem>> {
  // 1. 重新获取
  const items = await plugin.readDir(parent);
  debug(`重新获取: ${items.length}`)
  // 2. 获取当前缓存
  const cache = await sourceDiskDirDao.listFromFolder(parent.path, parent.source_disk_id);
  debug(`获取当前缓存: ${cache.length}`)
  // 3. 比较数据
  const oldNameMap = map(cache, 'name', (_a, b) => b);
  const oldSignMap = map(cache, 'sign', (_a, b) => b);
  debug("比较数据")
  for (let item of items) {
    const old = oldNameMap.get(item.name);
    if (old) {
      // 没有变化
      debug(`${item.name}: 没有变化`)
      oldNameMap.delete(item.name);
      continue;
    }
    const oldSign = oldSignMap.get(item.sign);
    if (oldSign) {
      const update_time = Date.now();
      // 名称发生变化，但未见没有发生变化，更新本身
      debug(`${item.name}: 名称发生变化「${oldSign}」=>「${item.name}」，但未见没有发生变化，更新本身`)
      await sourceDiskDirDao.updateById(oldSign.id, {
        name: item.name,
        path: item.path,
        update_time,
        type: item.type,
        extname: item.extname,
        size: item.size,
        last_modified: typeof item.lastModified === 'string' ? item.lastModified : dayjs(item.lastModified).format("YYYY-MM-DD HH:mm:ss"),
        cover: item.cover,
        expands: item.expands ? JSON.stringify(item.expands) : undefined
      });
      // 及全部子目录
      await renameSub(oldSign.source_disk_id, oldSign.path, item.path);
      oldNameMap.delete(oldSign.name);
      continue;
    }
    // 新的，则新增
    debug(`${item.name}: 新的，则新增`)
    await sourceDiskDirDao.saveCache([item], parent.source_disk_id);
  }
  debug(`比较数据完成,剩余需要删除数量：${oldNameMap.size}`)
  // 存在，则删除
  for (const value of oldNameMap.values()) {
    await sourceDiskDirDao.deleteById(value.id);
    // 子目录也删除
    await sourceDiskDirDao.query()
      .likeRight('folder', value.path)
      .eq('source_disk_id', value.source_disk_id)
      .batchList(100, async (list) => {
        for (let e of list) {
          await sourceDiskDirDao.deleteById(e.id);
        }
      });
  }


  // 更新当前为已刷新
  await sourceDiskDirDao.updateById(parent.id, {cache: 1, update_time: Date.now()});
  return items
}