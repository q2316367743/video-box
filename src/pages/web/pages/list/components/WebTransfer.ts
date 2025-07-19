import {useVideoSourceStore} from "@/store/index.js";
import MessageUtil from "@/utils/modal/MessageUtil.js";
import {importVideoSourceEntry} from "@/entities/VideoSource.js";
import {readFileAsText} from "@/utils/file/FileUtil.js";

export function webExport() {
  window.preload.dialog.downloadFile(
    JSON.stringify(useVideoSourceStore().sources),
    "网络资源导出.json"
  ).then(() => MessageUtil.success("导出成功"))
    .catch(e => MessageUtil.error("导出失败", e))
}

export async function webImport() {
  const file = await window.preload.dialog.openFile({
    buttonLabel: '导入',
    filters: [{
      name: 'JSON文件',
      extensions: ['json']
    }]
  })
  const data = await readFileAsText(file);
  const records = JSON.parse(data);
  if (!Array.isArray(records)) {
    return MessageUtil.error("导入数据格式错误");
  }
  for (let record of records) {
    try {
      const entry = await importVideoSourceEntry(record);
      await useVideoSourceStore().add(entry, 3);
    } catch (e) {
      return MessageUtil.error(`导入数据格式错误`, e);
    }
  }
}