import {extname, join} from 'node:path';
import {sourceDiskDao} from "@/dao";
import {pluginDiskGet} from "@/service/plugin/disk/PluginDiskGetService";
import {APP_TEMP_DIR} from "@/global/constant";
import {useSnowflake} from "@/utils/Snowflake";
import {DiskPlugin, DiskUploadOption} from "@/modules/disk/DiskPlugin";
import {runner} from "@/modules/task/TaskRunner";
import {SourceDiskDir} from "@/types/SourceDiskDIr";
import {diskFileUpload} from "@/modules/task/adhoc/DiskFileUpload";

export async function saveTempFile(filename: string, body: ReadableStream<Uint8Array>) {
  const tempFileName = useSnowflake().nextId() + extname(filename);
  // await Bun.write(join(APP_TEMP_DIR, tempFileName), new Response(body));
  const file = Bun.file(join(APP_TEMP_DIR, tempFileName));
  const writer = file.writer();

  const reader = body.getReader(); // 假设 body 非空
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    writer.write(value); // value 是 Uint8Array
  }
  await writer.end(); // 确保刷新并关闭文件
  return {tempFileName, reader: file.stream().getReader()};
}

async function taskUpload(folder: SourceDiskDir, option: DiskUploadOption, request: Request, plugin: DiskPlugin) {
  // 创建上传任务
  await runner.start(
    `${folder.path}:${option.filename}`,
    "internal",
    'disk:file-upload',
    async (ctx) => {
      await diskFileUpload(ctx, request, folder, plugin, option)
    })
}

export async function pluginDiskUploadService(request: Request, params: Record<string, string>, headers: Record<string, string>) {
  const {id} = params;
  const folderPath = decodeURIComponent(headers['folder-path']);
  const plugin = await sourceDiskDao.getPlugin(id);
  if (!plugin) return Promise.reject(new Error("插件不存在"));
  const folder = await pluginDiskGet(folderPath, plugin, id);
  if (!folder) return Promise.reject(new Error("文件夹项不存在"));
  const option: DiskUploadOption = {
    filename: decodeURIComponent(headers['file-name']),
    contentType: headers['file-type'],
    contentLength: Number(headers['content-length']),
    overwrite: headers['overwrite'] !== 'false',
    md5: headers['x-file-md5'],
    sha1: headers['x-file-sha1'],
    sha256: headers['x-file-sha256']
  };

  const asTask = typeof headers['as-task'] !== 'undefined' && headers['as-task'] !== 'false';
  if (asTask) {
    await taskUpload(folder, option, request, plugin);
  } else {
    await plugin.writeFile(request, folder, option);
  }
  await Bun.sleep(1000);
  return asTask;
}