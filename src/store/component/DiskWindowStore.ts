import {defineStore} from "pinia";
import {CustomerWindow, WindowUtil} from "@/utils/utools/WindowUtil.ts";
import MessageUtil from "@/utils/modal/MessageUtil.ts";
import {clone} from "@/utils/lang/ObjUtil.ts";
import {DiskInfo} from "@/entities/disk/DiskEntry.ts";

export const useDiskWindowStore = defineStore('disk-window-store', () => {
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
  }, 1000)

  async function closeDiskWindow() {
    if (cw) {
      await cw.close();
      cw = null;
    }
  }

  window.preload.ipcRenderer.receiveMessage('disk:from', ({event}) => {
    if (event === 'initialized') {
      stop.value = true;
    }
  })

  async function openDiskWindow(info: DiskInfo, index: number) {
    try {
      await closeDiskWindow();
      cw = WindowUtil.createBrowserWindow('disk', {
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
      const data = clone({info, index}, true);
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
      title.value = info.programs[index].title;
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
    openDiskWindow, closeDiskWindow
  }
})