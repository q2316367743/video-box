import {defineStore} from "pinia";
import {CustomerWindow, WindowUtil} from "@/utils/utools/WindowUtil.js";
import MessageUtil from "@/utils/modal/MessageUtil.js";
import {clone} from "@/utils/lang/ObjUtil.js";
import {M3u8Channel} from "@/entities/LiveSource.js";

export const useTvWindowStore = defineStore('tv-window-store', () => {
  let cw: CustomerWindow | null = null;
  const title = ref('');
  const stop = ref(false);

  // 检测窗口
  setInterval(async () => {
    if (!cw) {
      title.value = '';
      return;
    }
    if (await cw.isDestroyed()) {
      cw = null;
      title.value = '';
    }
  }, 1000);

  async function closeTvWindow() {
    if (cw) {
      await cw.close();
      cw = null;
    }
  }

  window.preload.ipcRenderer.receiveMessage('tv:from', ({event}) => {
    if (event === 'initialized') {
      stop.value = true;
    }
  })

  async function openTvWindow(sourceId: number, item: M3u8Channel) {
    try {
      await closeTvWindow();
      cw = WindowUtil.createBrowserWindow('tv', {
        width: 1200,
        height: 800,
        minWidth: 960,
        minHeight: 720,
        useContentSize: true,
        hasShadow: false,
        alwaysOnTop: false,
        backgroundColor: '#00000000',
      });
      await cw.open();
      const data = clone({sourceId, url: item.url}, true);
      stop.value = false;
      const interval = setInterval(() => {
        cw?.sendMessage({
          event: 'initialize',
          data
        });
        if (stop.value || !cw) {
          clearInterval(interval);
        }
      }, 1000);
      title.value = item.name;
      return cw;
    } catch (error) {
      title.value = '';
      cw = null;
      MessageUtil.error("打开播放器失败", error);
    }
  }

  useIntervalFn(() => {
    if (cw) {
      cw.isDestroyed().then(destroyed => {
        if (destroyed) {
          cw = null;
        }
      })
    }
  }, 5000, {
    immediate: true,
    immediateCallback: true
  });

  return {
    title,
    closeTvWindow, openTvWindow
  }
})