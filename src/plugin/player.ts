import MessageUtil from "@/utils/modal/MessageUtil";
import {SearchResultItem} from "@/pages/home/types/SearchResult";

export function openWebPlayer(sourceId: string, videoId: string, items?: Array<SearchResultItem>): Window | null {
  const url = `/web.html?source=${sourceId}&video=${videoId}`;
  const child = window.open(url);

  if (!child) {
    console.warn('弹窗被拦截');
    return null;
  }

  // 只监听一次 LOADED，收到后立即发送 items 并解绑
  const onMessage = (e: MessageEvent) => {
    // 只认来自目标子窗口且 origin 正确
    if (e.source === child && e.data === 'LOADED') {
      console.log(toRaw(items))
      child.postMessage(items ? toRaw(items) : [], location.origin);   // 发空数组兜底
      window.removeEventListener('message', onMessage);  // 立即取消监听
    }
  };

  window.addEventListener('message', onMessage);


  return child; // 调用方可保留句柄做其他事
}

export function openTvWindow(sourceId: string, videoId: string) {
  window.open(`/tv.html?source=${sourceId}&video=${videoId}`);
}

export function copyWebShare(sourceId: string, videoId: string): void {
  const target = `${location.origin}/web.html?source=${sourceId}&video=${videoId}`;
  navigator.clipboard.writeText(target)
    .then(() => {
      MessageUtil.success("已将链接复制到剪贴板，快去分享给其他人吧");
    });
}