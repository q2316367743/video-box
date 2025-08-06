import {Elysia, t} from "elysia";
import {sourceDiskDao} from "@/dao";
import {Result} from "@/views/Result";
import {pluginDiskListService} from "@/service/plugin/disk/PluginDiskListService";


export default new Elysia()
  .post(
    '/list/:id',
    async ({params, body}) => {
      const {id} = params;
      const {path, refresh} = body;
      const plugin = await sourceDiskDao.getPlugin(id);
      if (!plugin) return Result.error('源不存在');
      return Result.success(await pluginDiskListService(path, plugin, id, refresh))
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