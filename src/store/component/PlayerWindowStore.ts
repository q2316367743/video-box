import {defineStore} from "pinia";
import {CustomerWindow, WindowUtil} from "@/utils/utools/WindowUtil.ts";
import {VideoSourceEntry} from "@/entities/VideoSource.ts";
import {VideoDetail} from "@/modules/video/VideoPlugin.ts";
import MessageUtil from "@/utils/modal/MessageUtil.ts";
import {clone} from "@/utils/lang/ObjUtil.ts";
import {useMyVideoItemStore} from "@/store/db/MyVideoItemStore.js";

export const usePlayerWindowStore = defineStore('player-window-store', () => {
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

  async function closePlayerWindow() {
    if (cw) {
      await cw.close();
      cw = null;
    }
  }

  window.preload.ipcRenderer.receiveMessage('player:from', ({event}) => {
    if (event === 'initialized') {
      stop.value = true;
    }
  })

  // TODO: 此处需要可以播放聚合结果|相似资源
  async function openPlayerWindow(source: VideoSourceEntry, video: VideoDetail) {
    try {
      await closePlayerWindow();
      cw = WindowUtil.createBrowserWindow('player', {
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
      const data = clone({
        source: source,
        video: video
      }, true);
      stop.value = false;
      useMyVideoItemStore().post({
        type: "watched",
        from: 'web',
        payload: `${source.id}/${video.id}`,
        cover: video.cover,
        title: video.title,
        description: video.remark,
      }).then(() => console.debug("添加到播放记录"))
      const interval = setInterval(() => {
        cw?.sendMessage({
          event: 'initialize',
          data
        });
        if (stop.value || !cw) {
          clearInterval(interval);
        }
      }, 1000);
      title.value = video.title;
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
    openPlayerWindow, closePlayerWindow
  }
})