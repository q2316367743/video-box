import {join} from 'node:path';
import {SourceDiskDir} from "@/types/SourceDiskDIr";
import {DiskPlugin, DiskUploadOption} from "@/modules/disk/DiskPlugin";
import {APP_TEMP_DIR} from "@/global/constant";
import {diskRefreshCache} from "@/service/plugin/disk";
import {saveTempFile} from "@/service/plugin/disk/PluginDiskUploadService";
import {TaskRunnerContext} from "@/modules/task/TaskRunner";

/**
 * 磁盘文件上传
 * @param ctx 任务上下文
 * @param request 请求
 * @param folder
 * @param plugin
 * @param option 参数
 */
export async function diskFileUpload(ctx: TaskRunnerContext, request: Request, folder: SourceDiskDir, plugin: DiskPlugin, option: DiskUploadOption) {
  if (!request.body) return Promise.reject(new Error("请求体不存在"));
  // 保存临时文件
  const tempFileName = await saveTempFile(option.filename, request.body);
  // 获取临时文件
  const tempFile = Bun.file(join(APP_TEMP_DIR, tempFileName));
  try {
    ctx.update(33);
    // 写入
    await plugin.writeFile(new Request(request, {
      body: tempFile.stream()
    }), folder, option);
    ctx.update(66);
    // 刷新缓存
    await diskRefreshCache(folder, plugin);
    ctx.update(99);
  } finally {
    // 删除文件
    await tempFile.delete();
  }
}