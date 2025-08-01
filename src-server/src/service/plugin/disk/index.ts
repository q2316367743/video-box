import dayjs from "dayjs";
import {debug} from "@rasla/logify";
import {SourceDiskDir} from "@/types/SourceDiskDIr";
import {DirItem, DiskPlugin} from "@/modules/disk/DiskPlugin";
import {sourceDiskDirDao} from "@/dao";
import {map} from "@/utils/ArrayUtil";

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
      debug('及全部子目录')
      await sourceDiskDirDao.query()
        .likeRight('folder', oldSign.path)
        .eq('source_disk_id', oldSign.source_disk_id)
        .batchList(100, async (list) => {
          for (let e of list) {
            await sourceDiskDirDao.updateById(oldSign.id, {
              path: e.path.replace(oldSign.path, item.path),
              folder: e.folder.replace(oldSign.path, item.path),
              update_time,
            });
          }
        });
      oldNameMap.delete(oldSign.name);
      continue;
    }
    // 新的，则新增
    debug(`${item.name}: 新的，则新增`)
    await sourceDiskDirDao.saveCache([item], parent.source_disk_id);
  }
  debug(`比较数据完成,剩余需要删除数量：${oldNameMap.size}`)
  if (oldNameMap.size > 0) {
    // 存在，则删除
    for (let value of oldNameMap.values()) {
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

  }

  // 更新当前为已刷新
  await sourceDiskDirDao.updateById(parent.id, {cache: 1, update_time: Date.now()});
  return items
}

interface PathItem {
  name: string;
  path: string;
}

/**
 * 构建一个目录的全部缓存，并返回目录下全部文件项
 * @param path 目录
 * @param plugin 插件
 * @param id 来源ID
 */
export async function diskBuildCache(path: string, plugin: DiskPlugin, id: string): Promise<Array<DirItem>> {
  if (path === '/') {
    debug("构建根目录缓存")
    const parent = await sourceDiskDirDao.insert(sourceDiskDirDao.root(id));
    const items = await plugin.readDir(sourceDiskDirDao.root(id));
    await sourceDiskDirDao.updateById(parent.id, {cache: 1, update_time: Date.now()});
    await sourceDiskDirDao.saveCache(items, id);
    return items;
  }

  debug("构建目录树")
  const items = new Array<PathItem>();
  // 根目录
  items.push({name: '根目录', path: '/'});
  // 其他目录
  path.split("/").filter(e => e.length > 0).reduce((prev, curr) => {
    const path = (prev === '/' ? '' : prev) + '/' + curr;
    items.push({name: curr, path});
    return path;
  }, '');
  // 操作索引
  debug("操作索引")
  let index = items.length - 1;
  // 回推，查找最后的缓存目录
  debug("回推，查找最后的缓存目录")
  let target: SourceDiskDir | undefined = undefined;
  while (index >= 0) {
    const pathItem = items[index];
    debug(`查找目录「${pathItem.name}」，路径「${pathItem.path}」`);
    if (pathItem.path === '/') {
      target = sourceDiskDirDao.root(id);
      break;
    }
    const cache = await sourceDiskDirDao.getFromPath(pathItem.path, id);
    if (cache) {
      target = cache;
      break;
    }
    index -= 1;
  }
  if (!target) return Promise.reject(new Error("目录解析错误"));
  // 前进，找到缓存
  debug("前进，找到缓存")
  while (index < items.length) {
    const pathItem = items[index];
    const dirItems = await plugin.readDir(target);
    debug(`查询目录「${pathItem.name}」，路径「${pathItem.path}」，共「${dirItems.length}」个子路径`);
    // 保存缓存
    const sourceDiskDirs = await sourceDiskDirDao.saveCache(dirItems, id);
    // 更新当前为已刷新
    await sourceDiskDirDao.updateById(target.id, {cache: 1, update_time: Date.now()});
    // 寻找当前缓存
    target = sourceDiskDirs.find(dir => dir.name === pathItem.name);
    if (!target) return Promise.reject(new Error("目录解析错误"));
    index += 1;
  }
  // 获取 目录项
  const results = await sourceDiskDirDao.readDir(target);
  debug(`获取目录项「${target.path}」，共「${results.length}」个`);
  // 保存缓存
  await sourceDiskDirDao.saveCache(results, id);
  // 更新当前为已刷新
  await sourceDiskDirDao.updateById(target.id, {cache: 1, update_time: Date.now()});
  return results;
}