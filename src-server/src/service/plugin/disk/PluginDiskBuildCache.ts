import {DirItem, DiskPlugin} from "@/modules/disk/DiskPlugin";
import {debug} from "@rasla/logify";
import {sourceDiskDirDao} from "@/dao";
import {SourceDiskDir} from "@/types/SourceDiskDIr";

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