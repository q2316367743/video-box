import {Elysia, t} from "elysia";
import {sourceDiskDao, sourceDiskDirDao} from "@/dao";
import {pluginDiskGet} from "@/service/plugin/disk";
import {Result} from "@/views/Result";

export default new Elysia()
  .delete('/rm/:id', async ({params, body}) => {
    const {id} = params;
    const {path} = body;
    const plugin = await sourceDiskDao.getPlugin(id);
    if (!plugin) return Promise.reject(new Error("插件不存在"));
    const folder = await pluginDiskGet(path, plugin, id);
    if (!folder) return Promise.reject(new Error("文件夹不存在"));
    await plugin.rm(folder);

    // 删除子目录
    await sourceDiskDirDao.query().likeRight('folder', path).delete();

    return Result.success();
  }, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      path: t.String(),
    })
  })