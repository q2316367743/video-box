const port = import.meta.env.DEV ? 13001 : 13011;

window.preload.lib.createServer(port, () => {

}, e => {

});

export function renderLink(url: string) {
  return `http://127.0.0.1:${port}/preview?url=${encodeURIComponent(url)}`;
}