import MessageUtil from "@/utils/modal/MessageUtil";
import {adminSourceWebExport} from "@/apis/admin/source/web";

export function webSourceExport() {
  adminSourceWebExport().then(() => MessageUtil.success("导出成功"))
    .catch(e => MessageUtil.error("导出失败", e))
}