import {Elysia, t} from "elysia";
import {debug, error} from "@rasla/logify";
import {sourceDiskDao, sourceDiskDirDao} from "@/dao";
import {Result} from "@/views/Result";
import {shake} from "@/utils/lang/RecordUtil";
import {DiskPlugin} from "@/modules/disk/DiskPlugin";
import {SourceDiskDir} from "@/types/SourceDiskDIr";
import {diskRefreshCache, pluginDiskGet} from "@/service/plugin/disk";

interface Param {
  sign: string;
  sourceDiskDir: SourceDiskDir;
  plugin: DiskPlugin;
  headers: Record<string, string | undefined>;
  signal: AbortSignal;
}

/**
 * 刷新缓存
 * @param item 缓存项
 * @param plugin 插件
 */
async function refreshCache(item: SourceDiskDir, plugin: DiskPlugin): Promise<void> {
  // 获取所在目录
  const folder = await sourceDiskDirDao.getFromPath(item.folder, item.source_disk_id);
  if (!folder) return;
  await diskRefreshCache(folder, plugin);
}

async function getResponse(param: Param): Promise<Response> {
  // 获取缓存
  const {sourceDiskDir, plugin, headers, signal} = param;
  // 找到缓存记录
  const rsp = await plugin.readFile(sourceDiskDir, shake({
    connection: headers['connection'],
    range: headers['range'],
  }), signal);
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
    async ({params, query, set, headers, request}) => {
      const {sign} = query;
      const {id} = params;
      const path = decodeURIComponent('/' + params['*']);
      // 这里 path 就是 /proxy/disk/p/ 后面的任意路径
      const plugin = await sourceDiskDao.getPlugin(id);
      if (!plugin) {
        set.status = 500;
        return Result.error("磁盘插件未找到");
      }
      // 找到缓存记录
      const sourceDiskDir = await pluginDiskGet(path, plugin, id);
      if (!sourceDiskDir) {
        // 返回404
        return new Response('404 Not Found', {
          status: 404,
          statusText: 'NOT_FOUND'
        });
      }
      if (sourceDiskDir.type !== 'file') {
        return new Response('请求路径不是文件', {
          status: 404,
          statusText: 'REQUEST_NOT_FILE'
        });
      }

      // 由于可能是下载，所以要加入请求头
      // set.headers['']
      set.headers['Content-Disposition'] = `attachment; filename*=UTF-8''${encodeURIComponent(sourceDiskDir.name)}`;

      const {signal} = request;
      return getResponse({sign, plugin, headers, signal, sourceDiskDir});
    },
    {
      params: t.Object({
        id: t.String(),
        '*': t.String()
      }),
      query: t.Object({
        sign: t.String({
          default: ''
        })
      })
    })