import {Elysia, t} from "elysia";
import {Result} from "@/views/Result";
import {sourceDiskDao} from "@/dao";
import {pluginDiskGet} from "@/service/plugin/disk";

export default new Elysia()
  .post('/upload/:id', async ({request, params, headers}) => {

    if (!request.body) return Promise.reject(new Error("没有上传文件"));

    const {id} = params;
    const folderPath = decodeURIComponent(headers['Folder-Path']);
    const plugin = await sourceDiskDao.getPlugin(id);
    if (!plugin) return Promise.reject(new Error("插件不存在"));
    const folder = await pluginDiskGet(folderPath, plugin, id);
    if (!folder) return Promise.reject(new Error("文件夹项不存在"));

    const asTask = typeof headers['As-Task'] !== 'undefined' && headers['As-Task'] !== 'false';

    const ws = await plugin.writeFile(folder, {
      filename: decodeURIComponent(headers['File-Name']),
      contentType: headers['Content-Type'],
      contentLength: Number(headers['Content-Length']),
      overwrite: headers['Overwrite'] !== 'false',
      md5: headers['X-File-Md5'],
      sha1: headers['X-File-Sha1'],
      sha256: headers['X-File-Sha256']
    });
    await request.body.pipeTo(ws);
    return Result.success();
  }, {
    params: t.Object({
      id: t.String(),
    }),
    headers: t.Object({
      'Folder-Path': t.String(),
      'File-Name': t.String(),
      'Overwrite': t.String(),
      'Content-Type': t.String(),
      'Content-Length': t.String(),
      'As-Task': t.Optional(t.String()),
      'X-File-Md5': t.Optional(t.String()),
      'X-File-Sha1': t.Optional(t.String()),
      'X-File-Sha256': t.Optional(t.String())
    })
  })