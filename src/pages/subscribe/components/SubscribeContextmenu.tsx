import { isDark } from "@/store";
import { SourceSubscribe } from "@/types/SourceSubscribe";
import Ctx from '@imengyu/vue3-context-menu';
import { openSubscribeUpdateDialog } from './SubscribeUpdate';

export function openSubscribeContextmenu(e: MouseEvent, row: SourceSubscribe, onUpdate: () => void) {
  e.preventDefault();
  Ctx.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark.value ? 'mac dark' : 'mac',
    items: [{
      label: '编辑',
      onClick: () => {
        openSubscribeUpdateDialog(row, onUpdate);
      }
    }]
  })
}