import {useVideoSourceStore} from "@/store";
import MessageUtil from "@/utils/modal/MessageUtil";

export function webExport() {
  window.preload.dialog.downloadFile(
    JSON.stringify(useVideoSourceStore().sources),
    "网络资源导出.json"
  ).then(() => MessageUtil.success("导出成功"))
    .catch(e => MessageUtil.error("导出失败", e))
}

export function webImport() {
  window.preload.dialog.openFile({
    buttonLabel: '导入',
    filters: [{
      name: 'JSON文件',
      extensions: ['json']
    }]
  }).then((file) => {
    const fr = new FileReader();
    fr.onload = () => {
      const data = fr.result as string;
      // TODO JSON导入
    }
    fr.readAsText(file);
  })
}