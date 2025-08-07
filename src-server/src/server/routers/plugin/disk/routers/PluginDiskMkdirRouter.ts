import {Elysia, t} from "elysia";
import {sourceDiskDao} from "@/dao";
import {diskRefreshCache, pluginDiskGet} from "@/service/plugin/disk";
import {Result} from "@/views/Result";

export default new Elysia()
  .post('/mkdir/:id', async ({params, body}) => {
    const {id} = params;
    const {path, name} = body;
    const plugin = await sourceDiskDao.getPlugin(id);
    if (!plugin) return Promise.reject(new Error("插件不存在"));
    const folder = await pluginDiskGet(path, plugin, id);
    if (!folder) return Promise.reject(new Error("文件夹不存在"));
    await plugin.mkdir(folder, name);
    await diskRefreshCache(folder,  plugin);
    return Result.success();
  }, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      path: t.String(),
      name: t.String()
    })
  })