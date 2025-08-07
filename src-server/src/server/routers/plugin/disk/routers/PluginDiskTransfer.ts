import {Elysia, t} from "elysia";
import {sourceDiskDao} from "@/dao";
import {pluginDiskGet} from "@/service/plugin/disk";
import {Result} from "@/views/Result";
import {SourceDiskDir} from "@/types/SourceDiskDIr";
import {DiskPlugin} from "@/modules/disk/DiskPlugin";

async function getDir(id: string, plugin: DiskPlugin, from: string, to: string): Promise<{
  file: SourceDiskDir,
  folder: SourceDiskDir
}> {
  const file = await pluginDiskGet(from, plugin, id);
  if (!file) return Promise.reject(new Error("文件项不存在"));
  const folder = await pluginDiskGet(to, plugin, id);
  if (!folder) return Promise.reject(new Error("文件夹项不存在"));
  return {file, folder};
}

export default new Elysia()
  .put('/copy/:id', async ({params, body}) => {
    const {id} = params;
    const {from, to} = body;
    const plugin = await sourceDiskDao.getPlugin(id);
    if (!plugin) return Promise.reject(new Error("插件不存在"));
    const {file, folder} = await getDir(id, plugin, from, to);
    await plugin.cp(file, folder);
    // 刷新目标目录
    return Result.success();
  }, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      from: t.String(),
      to: t.String(),
    })
  })
  .put('/move/:id', async ({params, body}) => {
    const {id} = params;
    const {from, to} = body;
    const plugin = await sourceDiskDao.getPlugin(id);
    if (!plugin) return Promise.reject(new Error("插件不存在"));
    const {file, folder} = await getDir(id, plugin, from, to);
    await plugin.mv(file, folder);
    return Result.success();
  }, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      from: t.String(),
      to: t.String(),
    })
  })