import Hls from 'hls.js';
import flvjs from 'flv.js';
import Artplayer from "artplayer";

export function playFlv(video: HTMLVideoElement, url: string, art: Artplayer) {
  if (flvjs.isSupported()) {
    if (art.flv) art.flv.destroy();
    const flv = flvjs.createPlayer({type: 'flv', url});
    flv.attachMediaElement(video);
    flv.load();
    art.flv = flv;
    art.on('destroy', () => {
      try {
        flv.destroy()
      } catch (e) {
        console.error('销毁flv失败', e);
      }
    });
  } else {
    art.notice.show = 'Unsupported playback format: flv';
  }
}

export function playM3u8(video: HTMLVideoElement, url: string, art: Artplayer) {
  // @ts-ignore
  if (Hls.isSupported()) {
    if (art.hls) art.hls.destroy();
    // @ts-ignore
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
    art.hls = hls;
    art.on('destroy', () => hls.destroy());
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
  } else {
    art.notice.show = 'Unsupported playback format: m3u8';
  }
}