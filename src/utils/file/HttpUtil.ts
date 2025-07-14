import {useGet} from "@/hooks/HttpRequest";
import MessageUtil from "@/utils/modal/MessageUtil";

export async function fetchFavicon(url: string): Promise<string> {
  try {
    const u = new URL(url);
    // 获取域名
    const {data: html} = await useGet<string>(u.origin, {}, {
      responseType: 'text',
      timeout: 5000,
    });

    // 使用 DOMParser 解析 HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 查找 favicon 链接
    let faviconUrl = '';
    const linkElements = doc.querySelectorAll<HTMLLinkElement>("link[rel~='icon']");
    for (let i = 0; i < linkElements.length; i++) {
      if (linkElements[i].href) {
        faviconUrl = linkElements[i].href;
        break;
      }
    }
    faviconUrl = faviconUrl.replaceAll(location.origin, "");
    return new URL(faviconUrl, url).href;
  } catch (error) {
    MessageUtil.warning("获取图标失败", error);
    return "";
  }

}