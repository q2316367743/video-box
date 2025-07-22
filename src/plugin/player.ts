import MessageUtil from "@/utils/modal/MessageUtil.js";

export function openWebPlayer(sourceId: string, videoId: string): void {
  window.open(`/web.html?source=${sourceId}&video=${videoId}`);
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