import CtxMenu from "@imengyu/vue3-context-menu";
import {isDark} from "@/store/index.ts";
import {
  ChevronRightIcon,
  CircleIcon,
  DeleteIcon,
  EditIcon,
  FileExportIcon,
  FileImportIcon,
  FolderIcon,
  VideoIcon
} from "tdesign-icons-vue-next";
import {openVideoSourceDialog} from "@/pages/web/pages/components/VideoSourceDialog.tsx";
import {webExport, webImport} from "@/pages/web/pages/list/components/WebTransfer.ts";
import MessageBoxUtil from "@/utils/modal/MessageBoxUtil.tsx";
import MessageUtil from "@/utils/modal/MessageUtil.ts";
import {DialogPlugin, Paragraph} from "tdesign-vue-next";
import {WebItemView} from "@/views/WebItemView.js";
import {folderWebDelete, folderWebPost, folderWebRename} from "@/apis/folder-web/index.js";
import {sourceWebDelete, sourceWebMove} from "@/apis/source/web.js";
import FolderSelect from "@/components/FolderSelect/FolderSelect.vue";

function moveFileToFolder(source: WebItemView, update: () => void) {
  const folder = ref('');
  const p = DialogPlugin({
    header: '移动到目录',
    draggable: true,
    placement: "center",
    confirmBtn: "移动",
    default: () => <div>
      <Paragraph>请选择目录</Paragraph>
      <FolderSelect v-model={folder.value} size={'medium'} all={false}/>
    </div>,
    onConfirm: () => {
      sourceWebMove(source.id, folder.value)
        .then(() => {
          MessageUtil.success('移动成功');
          p.destroy();
          update();
        })
        .catch(e => MessageUtil.error("移动失败", e));
    },
  })
}

export const handleListContextmenu = (e: MouseEvent, update: () => void) => {
  e.preventDefault();
  e.stopPropagation();
  CtxMenu.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'dark' : 'light',
    items: [{
      label: '新增网络资源',
      icon: () => <VideoIcon/>,
      onClick: () => openVideoSourceDialog(update)
    }, {
      label: '新增文件夹',
      icon: () => <FolderIcon/>,
      onClick: () => MessageBoxUtil.prompt('请输入文件夹名称', '新增', {
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
    }, {
      label: '导入',
      icon: () => <FileImportIcon/>,
      onClick: webImport
    }, {
      label: '导出',
      icon: () => <FileExportIcon/>,
      onClick: webExport
    }]
  })
}


export const handleItemContextmenu = (e: MouseEvent, source: WebItemView, openInfo: (source: WebItemView) => void, update: () => void) => {
  e.preventDefault();
  e.stopPropagation();
  CtxMenu.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'dark' : 'light',
    items: source.folder ? [
      {
        label: '打开',
        icon: <CircleIcon/>,
        onClick: () => openInfo(source)
      },
      {
        label: '重命名',
        icon: () => <EditIcon/>,
        onClick: () => MessageBoxUtil.prompt('请输入新的文件夹名称', '重命名', {
          inputValue: source.name,
          inputPlaceholder: '请输入新的文件夹名称',
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(name => {
          folderWebRename(source.id, name)
            .then(() => MessageUtil.success('重命名成功'));
        })
      },
      {
        label: () => <span style={{color: 'var(--td-error-color)'}}>解散文件夹</span>,
        icon: () => <DeleteIcon style={{color: 'var(--td-error-color)'}}/>,
        onClick: () => MessageBoxUtil.confirm('确定要解散该文件夹吗？', '解散', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(() => {
          folderWebDelete(source.id)
            .then(() => MessageUtil.success('解散成功'))
            .catch(e => MessageUtil.error("解散失败", e));
        })
      }
    ] : [
      {
        label: '打开',
        icon: () => <CircleIcon/>,
        onClick: () => openInfo(source)
      },
      {
        label: '修改',
        icon: () => <EditIcon/>,
        onClick: () => openVideoSourceDialog(update, source.id)
      },
      {
        label: '移动到',
        icon: () => <ChevronRightIcon/>,
        onClick: () => moveFileToFolder(source, update)
      },
      {
        label: () => <span style={{color: 'var(--td-error-color)'}}>删除</span>,
        icon: () => <DeleteIcon style={{color: 'var(--td-error-color)'}}/>,
        onClick: () => MessageBoxUtil.confirm('确定要删除该资源吗？', '删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(() => {
          sourceWebDelete(source.id).then(() => MessageUtil.success('删除成功'))
        })
      }
    ]
  })
}