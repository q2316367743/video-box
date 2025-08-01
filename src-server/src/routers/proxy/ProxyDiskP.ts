import {Elysia, t} from "elysia";
import {sourceDiskDao, sourceDiskDirDao} from "@/dao";
import {Result} from "@/views/Result";
import {shake} from "@/utils/lang/RecordUtil";
import {DiskPlugin} from "@/modules/disk/DiskPlugin";
import {debug, error} from "@rasla/logify";
import {SourceDiskDir} from "@/types/SourceDiskDIr";
import {diskBuildCache, diskRefreshCache} from "@/service/plugin/disk";

interface Param {
  sourceId: string;
  path: string;
  sign: string;
  plugin: DiskPlugin;
  headers: Record<string, string | undefined>;
}

/**
 * 刷新缓存
 * @param item 缓存项
 * @param plugin 插件
 */
async function refreshCache(item: SourceDiskDir, plugin: DiskPlugin): Promise<void> {
  // 获取所在目录
  const folder = await sourceDiskDirDao.query().eq('path', item.folder).one();
  if (!folder) return;
  await diskRefreshCache(folder, plugin);
}

/**
 * 寻找缓存记录
 * @param path 目录
 * @param plugin 插件
 * @param id 来源ID
 */
async function getFromCache(path: string, plugin: DiskPlugin, id: string): Promise<SourceDiskDir | null> {
  // 获取缓存
  const cache = await sourceDiskDirDao.query().eq('path', path).one();
  if (cache) return cache;
  const items = await diskBuildCache(path, plugin, id);
  for (let item of items) {
    if (item.path === path) {
      // 确实存在
      const cache = await sourceDiskDirDao.query().eq('path', path).one();
      if (cache) return cache;
    }
  }
  return null;
}

async function request(param: Param): Promise<Response> {
  // 获取缓存
  const {sourceId, path, plugin, headers} = param;
  // 找到缓存记录
  const sourceDiskDir = await getFromCache(path, plugin, sourceId);
  if (!sourceDiskDir) {
    // 返回404
    return new Response('404 Not Found', {
      status: 404,
      statusText: 'NET_FOUND'
    });
  }
  if (sourceDiskDir.type !== 'file') {
    return new Response('请求路径不是文件', {
      status: 404,
      statusText: 'REQUEST_NOT_FILE'
    });
  }
  const rsp = await plugin.readFile(sourceDiskDir, shake({
    range: headers['Range'] || undefined
  }));
  if (rsp.status === 404) {
    // 虽然存在记录，但是文件实际不存在，所以要刷新缓存
    // 但是此处是异步的，不能阻塞当前进程
    refreshCache(sourceDiskDir, plugin)
      .then(() => debug(`刷新目录「${sourceDiskDir.folder}」完成`))
      .catch(e => {
        error("刷新目录失败：" + (e instanceof Error ? e.message : `${e}`));
        console.log(e);
      });
  }
  return rsp;
}


export default new Elysia()
  .get(
    '/disk/:id/p/*',
    async ({params, query, set, headers}) => {
      const {sign} = query;
      const {id} = params;
      const path = '/' + params['*'];
      // 这里 path 就是 /proxy/disk/p/ 后面的任意路径
      const plugin = await sourceDiskDao.getPlugin(id);
      if (!plugin) {
        set.status = 500;
        return Result.error("磁盘插件未找到");
      }
      return request({sourceId: id, path, sign, plugin, headers});
    },
    {
      params: t.Object({
        id: t.String(),
        '*': t.String()
      }),
      query: t.Object({
        sign: t.String()
      })
    })