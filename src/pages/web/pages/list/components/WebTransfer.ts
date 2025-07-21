import MessageUtil from "@/utils/modal/MessageUtil.js";
import {sourceWebExport} from "@/apis/source-web/index.js";

export function webExport() {
  sourceWebExport().then(() => MessageUtil.success("导出成功"))
    .catch(e => MessageUtil.error("导出失败", e))
}

export async function webImport() {
}