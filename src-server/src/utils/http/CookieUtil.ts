// cookie-util.ts
import {CookieMap} from "bun";
import {AxiosResponse} from "axios";

/**
 * 从一个cookie字符串中删除一个cookie并返回新cookie字符串
 * @param cookieString 原始cookie字符串
 * @param cookieName 要删除的cookie名称
 * @returns 新的cookie字符串
 */
export function removeCookie(cookieString: string, cookieName: string): string {
  const cookies = new CookieMap(cookieString);
  cookies.delete(cookieName);

  // 构建新的cookie字符串
  return Array.from(cookies.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

/**
 * 从一个cookie字符串中设置一个cookie，不存在则新增，并返回新的cookie字符串
 * @param cookieString 原始cookie字符串
 * @param name cookie名称
 * @param value cookie值
 * @param options cookie选项（可选）
 * @returns 新的cookie字符串
 */
export function setCookie(
  cookieString: string,
  name: string,
  value: string,
  options?: any
): string {
  const cookies = new CookieMap(cookieString);
  cookies.set(name, value, options);

  // 构建新的cookie字符串
  return Array.from(cookies.entries())
    .map(([key, val]) => `${key}=${val}`)
    .join('; ');
}

/**
 * 从一个cookie字符串中获取一个cookie
 * @param cookieString 原始cookie字符串
 * @param name cookie名称
 * @returns 新的cookie字符串
 */
export function getCookie(
  cookieString: string,
  name: string,
): string | null {
  const cookies = new CookieMap(cookieString);
  return cookies.get(name)
}

/**
 * 根据axios的response和cookie字符串，生成最新的cookie字符串
 * @param response axios响应对象
 * @param currentCookieString 当前的cookie字符串
 * @returns 更新后的cookie字符串
 */
export function updateFromResponse(
  response: AxiosResponse,
  currentCookieString: string = ""
): string {
  if (!response?.headers?.["set-cookie"]) {
    return currentCookieString;
  }

  const setCookieHeaders = response.headers["set-cookie"];
  const cookies = new CookieMap(currentCookieString);

  // 处理set-cookie头，可能是数组或字符串
  const cookieArray = Array.isArray(setCookieHeaders)
    ? setCookieHeaders
    : [setCookieHeaders];

  cookieArray.forEach((cookieHeader: string) => {
    // 解析每个set-cookie头
    const cookieParts = cookieHeader.split(';');
    const [nameValue] = cookieParts;
    const [name, value] = nameValue.split('=');

    if (name && value !== undefined) {
      // 只更新cookie值，保留其他属性
      cookies.set(name.trim(), value.trim());
    }
  });

  // 构建最终的cookie字符串
  return Array.from(cookies.entries())
    .map(([key, val]) => `${key}=${val}`)
    .join('; ');
}

/**
 * 将cookie字符串解析为对象
 * @param cookieString cookie字符串
 * @returns cookie对象
 */
export function parseCookie(cookieString: string): Record<string, string> {
  if (!cookieString) return {};

  return cookieString
    .split(';')
    .reduce((acc: Record<string, string>, cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value !== undefined) {
        acc[name.trim()] = decodeURIComponent(value.trim());
      }
      return acc;
    }, {});
}

/**
 * 将cookie对象序列化为字符串
 * @param cookieObj cookie对象
 * @returns cookie字符串
 */
export function serializeCookie(cookieObj: Record<string, string>): string {
  return Object.entries(cookieObj)
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join('; ');
}