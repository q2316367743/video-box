import {Elysia, t} from "elysia";
import {sourceDiskDao} from "@/dao";
import {pluginDiskRename} from "@/service/plugin/disk/PluginDiskRenameService";
import {Result} from "@/views/Result";

export default new Elysia()
  .put('/rename/:id', async ({params, body}) => {
    const {id} = params;
    const {path, name} = body;
    const plugin = await sourceDiskDao.getPlugin(id);
    if (!plugin) return Promise.reject(new Error("插件不存在"));
    await pluginDiskRename(plugin, path, name, id);
    return Result.success();
  }, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      path: t.String(),
      name: t.String(),
    }),
  })