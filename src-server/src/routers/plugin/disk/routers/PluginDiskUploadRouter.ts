import {Elysia, t} from "elysia";
import {Result} from "@/views/Result";
import {sourceDiskDao} from "@/dao";
import {pluginDiskGet} from "@/service/plugin/disk";

export default new Elysia()
  .post('/upload/:id', async ({request, params, headers}) => {

    if (!request.body) return Promise.reject(new Error("没有上传文件"));

    const {id} = params;
    const folderPath = decodeURIComponent(headers['folder-path']);
    const plugin = await sourceDiskDao.getPlugin(id);
    if (!plugin) return Promise.reject(new Error("插件不存在"));
    const folder = await pluginDiskGet(folderPath, plugin, id);
    if (!folder) return Promise.reject(new Error("文件夹项不存在"));

    const asTask = typeof headers['as-task'] !== 'undefined' && headers['as-task'] !== 'false';

    const ws = await plugin.writeFile(folder, {
      filename: decodeURIComponent(headers['file-name']),
      contentType: headers['content-type'],
      contentLength: Number(headers['content-length']),
      overwrite: headers['overwrite'] !== 'false',
      md5: headers['x-file-md5'],
      sha1: headers['x-file-sha1'],
      sha256: headers['x-file-sha256']
    });
    await request.body.pipeTo(ws);
    await Bun.sleep(1000);
    return Result.success();
  }, {
    params: t.Object({
      id: t.String(),
    }),
    headers: t.Record(t.String(), t.Any())
  })