import iconv from 'iconv-lite';


/**
 * 解析buffer内容
 * @param buffer  buffer
 * @param charset 编码
 * @return 字符串
 */
export function parseBuffer(buffer: Buffer, charset: string) {
  return iconv.decode(buffer, charset);

}

/**
 * 解析ArrayBuffer内容
 * @param buffer buffer
 * @param charset  编码
 * @return  字符串
 */
export function parseArrayBuffer(buffer: ArrayBuffer, charset: string) {
  return iconv.decode(Buffer.from(buffer), charset);
}


/**
 * 编码转换
 * @param content 内容
 * @param source 原始编码
 * @param target 目标编码
 * @return  内容
 */
export function convertCharset(content: string, source: string, target = 'utf-8') {
  if (source.toUpperCase() === target.toUpperCase()) {
    // 编码一致
    return content;
  }
  const buffer = iconv.encode(content, source);
  return parseBuffer(buffer, target);
}

