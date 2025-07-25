import MessageBoxUtil from "@/utils/modal/MessageBoxUtil.js";
import {folderWebDelete, folderWebPost} from "@/apis/folder-web/index.js";
import MessageUtil from "@/utils/modal/MessageUtil.js";
import {Folder} from "@/views/Folder.js";
import {adminSourceWebExport} from "@/apis/admin/source/web.js";

export function addFolderWeb(update: () => void) {
  MessageBoxUtil.prompt('请输入文件夹名称', '新增', {
    inputValue: '',
    inputPlaceholder: '请输入文件夹名称',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(name => {
    folderWebPost(name)
      .then(() => {
        MessageUtil.success('新增成功');
        update();
      })
      .catch(e => MessageUtil.error(e));
  })
}

export function removeFolderWeb(source: Folder, update: () => void) {
  folderWebDelete(source.id)
    .then(() => {
      update();
      MessageUtil.success('解散成功')
    });
}

export function webSourceExport() {
  adminSourceWebExport().then(() => MessageUtil.success("导出成功"))
    .catch(e => MessageUtil.error("导出失败", e))
}