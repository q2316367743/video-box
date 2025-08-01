/**
 * 从 ReadableStream<Uint8Array> 中读取文本内容
 * @param stream 输入的可读流
 * @param encoding 文本编码，默认 'utf-8'
 * @returns 返回读取的文本内容
 */
export async function readTextFromReadableStream(
  stream: ReadableStream<Uint8Array>,
  encoding: Bun.Encoding = 'utf-8'
): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder(encoding);
  let result = '';

  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      result += decoder.decode(value, {stream: true});
    }

    // 结束解码，处理可能的尾部字符
    result += decoder.decode();

    return result;
  } finally {
    reader.releaseLock();
  }
}