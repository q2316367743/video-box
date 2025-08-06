import Ctx, { type MenuItem } from "@imengyu/vue3-context-menu";
import { DirItem } from "@/apis/plugin/disk/list.ts";
import { isDark } from "@/store";
import {
  DeleteIcon,
  Edit2Icon,
  FileDownloadIcon,
  FilePasteIcon,
  FileTransmitIcon,
  InfoCircleIcon,
  LinkIcon
} from "tdesign-icons-vue-next";
import MessageBoxUtil from "@/utils/modal/MessageBoxUtil.tsx";
import { pluginDiskRename, pluginDiskRm } from "@/apis/plugin/disk/link.ts";
import MessageUtil from "@/utils/modal/MessageUtil.ts";
import { useUserStore } from "@/store/UserStore.ts";
import { downloadByUrl } from "@/utils/lang/BrowserUtil.ts";
import { openDirItemTransfer } from "@/pages/disk/info/dialog/DirItemTransfer.tsx";
import { openDirItemInfoDialog } from "./DirItemInfoDialog";

export function handleDirItemContextmenu(sourceId: string, item: DirItem, e: MouseEvent, onUpdate: () => void) {
  e.preventDefault();
  e.stopPropagation();
  const items: Array<MenuItem> = [
    {
      label: '重命名',
      icon: () => <Edit2Icon />,
      onClick: () => {
        MessageBoxUtil.prompt("请输入新的名字", "重命名", {
          inputValue: item.name,
          inputPlaceholder: '请输入新的名字',
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(name => {
          //重命名
          pluginDiskRename(sourceId, item.path, name)
            .then(() => {
              MessageUtil.success('重命名成功');
              onUpdate();
            })
        })
      }
    }, {
      label: '移动',
      icon: () => <FileTransmitIcon />,
      onClick: () => openDirItemTransfer(true, sourceId, item, onUpdate)
    }, {
      label: '复制',
      icon: () => <FilePasteIcon />,
      onClick: () => openDirItemTransfer(false, sourceId, item, onUpdate)
    }, {
      label: () => <span class={'label'} style={{ color: 'var(--td-error-color)' }}>删除</span>,
      icon: () => <DeleteIcon style={{ color: 'var(--td-error-color)' }} />,
      onClick: () => {
        MessageBoxUtil.alert(`确定要「${item.name}」删除吗？`, "删除", {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(() => {
          //删除
          pluginDiskRm(sourceId, item.path)
            .then(() => {
              MessageUtil.success('删除成功');
              onUpdate();
            })
        })
      }
    }
  ];
  if (item.type === 'file') {
    items.push({
      label: '复制链接',
      icon: () => <LinkIcon />,
      onClick: () => {
        const { token } = useUserStore();
        const url = `${location.origin}/api/proxy/disk/${sourceId}/p${item.path}?authorization=${token}`
        navigator.clipboard.writeText(url)
          .then(() => MessageUtil.success("链接已复制到剪切板"))
          .catch(e => MessageUtil.error("腹肌失败", e))
      }
    }, {
      label: '下载',
      icon: () => <FileDownloadIcon />,
      onClick: () => {
        const { token } = useUserStore();
        const url = `${location.origin}/api/proxy/disk/${sourceId}/p${item.path}?authorization=${token}`
        downloadByUrl(url);
      }
    })
  }
  items.push({
    label: '属性',
    icon: () => <InfoCircleIcon />,
    onClick: () => openDirItemInfoDialog(item)
  })
  Ctx.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'mac dark' : 'mac',
    items
  })
}