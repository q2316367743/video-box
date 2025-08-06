import {Elysia, t} from "elysia";
import {sourceDiskDao} from "@/dao";
import {Result} from "@/views/Result";
import {pluginDiskGet} from "@/service/plugin/disk";
import {pluginDiskListService} from "@/service/plugin/disk/PluginDiskListService";

export default new Elysia()
  .post('/brother/:id', async ({params, body}) => {
    const {id} = params;
    const {path} = body;
    const plugin = await sourceDiskDao.getPlugin(id);
    if (!plugin) {
      return Result.error("磁盘插件未找到");
    }
    const target = await pluginDiskGet(path, plugin, id);
    if (!target) {
      return Result.error("目标项不存在");
    }
    return Result.success(await pluginDiskListService(target.folder, plugin, id, false));
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      path: t.String()
    }),
  })