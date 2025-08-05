import {join} from 'node:path';
import {SourceDiskDir} from "@/types/SourceDiskDIr";
import {DiskPlugin, DiskUploadOption} from "@/modules/disk/DiskPlugin";
import {APP_TEMP_DIR} from "@/global/constant";
import {diskRefreshCache} from "@/service/plugin/disk";

/**
 * 磁盘文件上传
 * @param tempFileName
 * @param folder
 * @param plugin
 * @param option 参数
 */
export async function diskFileUpload(tempFileName: string, folder: SourceDiskDir, plugin: DiskPlugin, option: DiskUploadOption) {
  // 获取文件
  const tempFile = Bun.file(join(APP_TEMP_DIR, tempFileName));
  try {
    // 获取写入流
    const writableStream = await plugin.writeFile(folder, option);
    // 读取文件并上传
    await tempFile.stream().pipeTo(writableStream);
    // 刷新缓存
    await diskRefreshCache(folder, plugin);
    // 删除临时文件
  } finally {
    await tempFile.delete();
  }

}