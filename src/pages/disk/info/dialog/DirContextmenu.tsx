import Ctx from "@imengyu/vue3-context-menu";
import {DirItem} from "@/apis/plugin/disk/list.ts";
import {isDark} from "@/store";
import {
  FileAddIcon,
  InfoCircleIcon,
  RefreshIcon
} from "tdesign-icons-vue-next";
import {openDirItemTransfer} from "@/pages/disk/info/dialog/DirItemTransfer.tsx";

interface DirContextmenuProps {
  sourceId: string;
  item: DirItem;
  e: MouseEvent;
  onRefresh: (r: boolean) => void;
}

export function handleDirContextmenu(props: DirContextmenuProps) {
  const {sourceId, item, e, onRefresh} = props;
  e.preventDefault();
  e.stopPropagation();
  Ctx.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'mac dark' : 'default',
    items: [{
      label: '新增文件夹',
      icon: () => <FileAddIcon/>,
      onClick: () => openDirItemTransfer(true, sourceId, item, () => onRefresh(false))
    }, {
      label: '刷新',
      icon: () => <RefreshIcon/>,
      onClick: () => onRefresh(false)
    }, {
      label: '强制刷新',
      icon: () => <RefreshIcon/>,
      onClick: () => onRefresh(true)
    }, {
      label: '属性',
      icon: () => <InfoCircleIcon/>,
      onClick: () => openDirItemTransfer(false, sourceId, item, () => onRefresh(false))
    }]
  })
}