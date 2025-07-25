import MessageBoxUtil from "@/utils/modal/MessageBoxUtil.js";
import {folderWebDelete, folderWebPost, folderWebRename} from "@/apis/folder-web/index.js";
import MessageUtil from "@/utils/modal/MessageUtil.js";
import {Folder} from "@/views/Folder.js";

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


export function updateFolderWeb(source: Folder, update: () => void) {
  MessageBoxUtil.prompt('请输入文件夹名称', '新增', {
    inputValue: source.name,
    inputPlaceholder: '请输入文件夹名称',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(name => {
    folderWebRename(source.id, name)
      .then(() => {
        MessageUtil.success('新增成功');
        update();
      });
  })
}

export function removeFolderWeb(source: Folder, update: () => void) {
  folderWebDelete(source.id)
    .then(() => {
      update();
      MessageUtil.success('删除成功')
    });
}