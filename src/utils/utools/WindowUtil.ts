// 窗口相关工具

export interface CustomerWindowProps extends BrowserWindow.InitOptions {
  useContentSize: boolean;
  width: number
  height: number;
  minWidth: number;
  minHeight: number;
  hasShadow: boolean;
  resizable: boolean
  alwaysOnTop: boolean
  frame: boolean
  transparent: boolean
  backgroundColor: string
  icon: string
  show: boolean
  x: number
  y: number;
  params?: Record<string, string>
}

/**
 * 自定义窗口
 */
export interface CustomerWindow {

  /**
   * 打开自定义窗口
   */
  open(): Promise<void>;

  /**
   * 向子窗口发送消息
   * @param message 消息
   */
  sendMessage<T = any>(message: IpcEvent<T>): Promise<void>;

  close(): Promise<void>;

  hide(): Promise<void>;

  show(): Promise<void>;

  setAlwaysOnTop(alwaysOnTop: boolean): Promise<void>;

  isAlwaysOnTop(): Promise<boolean>;

  isDestroyed(): Promise<boolean>;

  minimize(): Promise<void>;

}

class CustomerWindowForUTools implements CustomerWindow {
  private readonly label: SubWindowChannel;
  private readonly props: Partial<CustomerWindowProps>;
  private win: BrowserWindow.WindowInstance | null;

  constructor(label: SubWindowChannel, props: Partial<CustomerWindowProps>) {
    this.label = label;
    this.props = props;
    this.win = null;
  }

  open(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const dev = utools.isDev();
      this.win = utools.createBrowserWindow(dev ? 'test.html' : `dist/${this.label}.html`, {
        ...this.props,
        webPreferences: {
          preload: 'src/preload.js',
          zoomFactor: 0,
          devTools: dev,
          webviewTag: true,
        },
      }, () => {
        try {
          if (!this.win) return;
          // 显示窗口
          this.win.show();
          if (dev) {
            let u = this.label + '.html';
            if (this.props.params) {
              const p = new URLSearchParams();
              Object.entries(this.props.params).forEach(([key, value]) => p.append(key, value));
              u += `?${p.toString()}`
            }
            this.win.webContents.executeJavaScript(`location.href = 'http://localhost:5173/${u}'`)
              .then(() => console.debug("代码执行成功"))
              .catch((e: any) => console.error("代码执行失败", e));
            this.win.webContents.openDevTools();
          }
          // 监听事件
          resolve()
        } catch (e) {
          reject(e);
        }
      });
    })
  }

  async sendMessage<T = any>(message: IpcEvent<T>): Promise<void> {
    if (!this.win) return;
    console.debug(this.win.webContents.id, `${this.label}:to`, message)
    window.preload.ipcRenderer.sendMessage<T>(this.win.webContents.id, `${this.label}:to`, message);
  }

  async close() {
    if (!this.win) return Promise.reject(new Error("窗口未打开"));
    this.win.close();
  }

  async hide() {
    if (!this.win) return Promise.reject(new Error("窗口未打开"));
    this.win.hide();
  }

  async show() {
    if (!this.win) return Promise.reject(new Error("窗口未打开"));
    this.win.show();
  }

  async isAlwaysOnTop() {
    if (!this.win) return false;
    return this.win.isAlwaysOnTop();
  }

  async setAlwaysOnTop(alwaysOnTop: boolean): Promise<void> {
    if (!this.win) return Promise.reject(new Error("窗口未打开"));
    this.win.setAlwaysOnTop(alwaysOnTop);
  }


  async isDestroyed() {
    if (!this.win) return true;
    return this.win.isDestroyed();
  }

  async minimize(): Promise<void> {
    if (!this.win) return Promise.reject(new Error("窗口未打开"));
    this.win.minimize();
  }
}


export const WindowUtil = {
  createBrowserWindow(label: SubWindowChannel, options: Partial<CustomerWindowProps>): CustomerWindow {
    return new CustomerWindowForUTools(label, options);
  },
  buildSubWindow(channel: SubWindowChannel): SubWindow {
    return window.preload.ipcRenderer.buildSubWindow(channel);
  },
  receiveMessage<T = any>(channelName: ChannelName, callback: (msg: IpcEvent<T>) => void): void {
    window.preload.ipcRenderer.receiveMessage(channelName, callback);
  },
  sendToParent(channel: string, ...params: any[]): void {
    utools.sendToParent(channel, ...params);
  }
}
