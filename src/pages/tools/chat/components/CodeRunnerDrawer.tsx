import { DrawerPlugin } from 'tdesign-vue-next'
import { openChat2ToolDialog } from './Chat2ToolAdd';

interface DrawerOptions {
  width?: string
  title?: string
  closable?: boolean
  maskClosable?: boolean;
  footer?: boolean
}

// 使用TDesign的DrawerPlugin打开抽屉
export const openCodeRunnerDrawer = (html: string, options: DrawerOptions = {}) => {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const dp = DrawerPlugin({
    header: options.title || '抽屉',
    size: options.width || '50vw',
    closeOnOverlayClick: false,
    footer: options.footer ?? true,
    confirmBtn: '添加到工具',
    closeBtn: true,
    onCancel() {
      dp.destroy?.();
    },
    default: () => <>
      <div class="iframe-container">
        <iframe
          src={url}
          class="preview-iframe w-full"
          frameborder="0"
          style={{ height: (options.footer ?? true) ? 'calc(100vh - 166px)' : 'calc(100vh - 94px)' }}
          sandbox="allow-scripts allow-same-origin allow-forms"
        ></iframe>
      </div>
    </>,
    onClose() {
      URL.revokeObjectURL(url);
      dp.destroy?.();
    },
    onConfirm() {
      openChat2ToolDialog(html, () => dp.destroy?.());
    },
  });
}