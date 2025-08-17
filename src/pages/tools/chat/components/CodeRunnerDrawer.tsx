import { DrawerPlugin } from 'tdesign-vue-next'

interface DrawerOptions {
  width?: string
  title?: string
  closable?: boolean
  maskClosable?: boolean
}

// 使用TDesign的DrawerPlugin打开抽屉
export const openDrawer = (html: string, options: DrawerOptions = {}) => {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const dp = DrawerPlugin({
    header: options.title || '抽屉',
    size: options.width || '50vw',
    closeOnOverlayClick: false,
    onCancel() {
      dp.destroy?.();
    },
    default: () => <>
      <div class="iframe-container">
        <iframe
          src={url}
          class="preview-iframe w-full"
          frameborder="0"
          style={{height: 'calc(100vh - 152px)'}}
          sandbox="allow-scripts allow-same-origin allow-forms"
        ></iframe>
      </div>
    </>,
    onClose() {
      URL.revokeObjectURL(url);
    }
  });
}