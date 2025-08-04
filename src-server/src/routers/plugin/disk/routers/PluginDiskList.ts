import {Elysia, t} from "elysia";
import {debug} from "@rasla/logify";
import {sourceDiskDao, sourceDiskDirDao} from "@/dao";
import {Result} from "@/views/Result";
import {diskBuildCache, diskRefreshCache} from "@/service/plugin/disk";


export default new Elysia()
  .post(
    '/list/:id',
    async ({params, body}) => {
      const {id} = params;
      const {path, refresh} = body;
      const plugin = await sourceDiskDao.getPlugin(id);
      if (!plugin) return Result.error('源不存在');

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
            return Result.success(await diskRefreshCache(parent, plugin));
          } else {
            // 不强制刷新，使用缓存
            debug('不强制刷新，使用缓存')
            return Result.success(await sourceDiskDirDao.readDir(parent));
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
          return Result.success(items);
        }
      } else {
        // 没有目录
        debug('没有目录')
        return Result.success(await diskBuildCache(path, plugin, id));
      }

    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        path: t.String(),
        refresh: t.Boolean({
          default: false
        })
      })
    })