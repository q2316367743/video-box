export function openWebPlayer(sourceId: string, videoId: string): void {
  window.open(`/web.html?source=${sourceId}&video=${videoId}`);
}

export function openTvWindow(sourceId: string, videoId: string) {
  window.open(`/tv.html?source=${sourceId}&video=${videoId}`);
}