import Ctx from "@imengyu/vue3-context-menu";
import { DirItem } from "@/apis/plugin/disk/list.ts";
import { isDark } from "@/store";
import {
  FileAddIcon,
  InfoCircleIcon,
  RefreshIcon, UploadIcon
} from "tdesign-icons-vue-next";
import { openDirItemTransfer } from "@/pages/disk/info/dialog/DirItemTransfer.tsx";
import { openDiskUploadDialog } from "@/pages/disk/info/dialog/DiskUpload.tsx";
import MessageBoxUtil from "@/utils/modal/MessageBoxUtil.tsx";
import { pluginDiskMkdir } from "@/apis/plugin/disk/link.ts";
import MessageUtil from "@/utils/modal/MessageUtil.ts";
import { openDirItemInfoDialog } from "./DirItemInfoDialog";

interface DirContextmenuProps {
  sourceId: string;
  item: DirItem;
  e: MouseEvent;
  onRefresh: (r: boolean) => void;
}

export function handleDirContextmenu(props: DirContextmenuProps) {
  const { sourceId, item, e, onRefresh } = props;
  e.preventDefault();
  e.stopPropagation();
  Ctx.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'mac dark' : 'default',
    items: [{
      label: '上传文件',
      icon: () => <UploadIcon />,
      onClick: () => openDiskUploadDialog(sourceId, item.path, () => onRefresh(true))
    }, {
      label: '新增文件夹',
      icon: () => <FileAddIcon />,
      onClick: () =>
        MessageBoxUtil.prompt("请输入文件夹名称", "新建文件夹", {
          inputPlaceholder: '请输入新的名字',
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(name => {
          //重命名
          pluginDiskMkdir(sourceId, item.path, name)
            .then(() => {
              MessageUtil.success('重命名成功');
              onRefresh(false);
            })
        })
    }, {
      label: '刷新',
      icon: () => <RefreshIcon />,
      onClick: () => onRefresh(false)
    }, {
      label: '强制刷新',
      icon: () => <RefreshIcon />,
      onClick: () => onRefresh(true)
    }, {
      label: '属性',
      icon: () => <InfoCircleIcon />,
      onClick: () => openDirItemInfoDialog(item)
    }]
  })
}