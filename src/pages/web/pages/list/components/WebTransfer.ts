import {useVideoSourceStore} from "@/store/index.js";
import MessageUtil from "@/utils/modal/MessageUtil.js";

export function webExport() {
  window.preload.dialog.downloadFile(
    JSON.stringify(useVideoSourceStore().sources),
    "网络资源导出.json"
  ).then(() => MessageUtil.success("导出成功"))
    .catch(e => MessageUtil.error("导出失败", e))
}

export async function webImport() {
}