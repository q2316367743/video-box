import {extname, join} from 'node:path';
import {sourceDiskDao} from "@/dao";
import {pluginDiskGet} from "@/service/plugin/disk/PluginDiskGetService";
import {APP_TEMP_DIR} from "@/global/constant";
import {useSnowflake} from "@/utils/Snowflake";
import {DiskPlugin, DiskUploadOption} from "@/modules/disk/DiskPlugin";
import {runner} from "@/modules/task/TaskRunner";
import {SourceDiskDir} from "@/types/SourceDiskDIr";
import {diskFileUpload} from "@/modules/task/impl/DiskFileUpload";

async function saveTempFile(filename: string, body: ReadableStream<Uint8Array>) {
  const tempFileName = useSnowflake().nextId() + extname(filename);
  await Bun.write(join(APP_TEMP_DIR, tempFileName), new Response(body));
  return tempFileName;
}

async function taskUpload(folder: SourceDiskDir, option: DiskUploadOption, body: ReadableStream<Uint8Array>, plugin: DiskPlugin) {
  // 保存临时文件
  const tempFileName = await saveTempFile(option.filename, body);
  // 创建上传任务
  await runner.start(
    `${folder.path}:${option.filename}`,
    "internal",
    'disk:file-upload',
    async (ctx) => {
      // 上传文件到本地磁盘
      await diskFileUpload(tempFileName, folder, plugin, option);
      // 获取读取流
      const ws = await plugin.writeFile(folder, option);
      // 写入
      const tempFile = Bun.file(join(APP_TEMP_DIR, tempFileName));
      await tempFile.stream().pipeTo(ws);
    })
}

async function syncUpload(folder: SourceDiskDir, option: DiskUploadOption, body: ReadableStream<Uint8Array>, plugin: DiskPlugin) {
  const ws = await plugin.writeFile(folder, option);
  await body.pipeTo(ws);
}

export async function pluginDiskUploadService(request: Request, params: Record<string, string>, headers: Record<string, string>) {
  if (!request.body) return Promise.reject(new Error("没有上传文件"));
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
    await taskUpload(folder, option, request.body, plugin);
  } else {
    await syncUpload(folder, option, request.body, plugin);
  }
  await Bun.sleep(1000);
  return asTask;
}