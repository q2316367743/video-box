// sse.ts
type Payload = Record<string, unknown>;

export interface SseProps {
  url: string,
  token: string
  // 请求体
  payload: Payload,
  // 事件名（仅作日志/区分用，目前 OpenAI 风格接口所有数据都在 message 事件）
  event: string,
  // 每当收到一个有效 chunk 时调用
  callback: (data: any) => void
}

/**
 * 封装 SSE 工具
 * @param props 参数
 * @returns Promise<void> 流结束时 resolve；出错时 reject
 */
export async function sendSse(props: SseProps): Promise<void> {
  const {url, token, payload, event, callback} = props;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({...payload, stream: true})
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }
  if (!res.body) {
    throw new Error("无返回流");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  return new Promise<void>((resolve, reject) => {
    const pump = async () => {
      try {
        while (true) {
          const {done, value} = await reader.read();
          if (done) break;

          buf += decoder.decode(value, {stream: true});
          const lines = buf.split("\n");
          buf = lines.pop()!;

          for (const ln of lines) {
            const eventName = `${event}: `;
            if (!ln.startsWith(eventName)) continue;
            const raw = ln.slice(eventName.length).trim();
            if (raw === "[DONE]") {
              resolve(); // 正常结束
              return;
            }
            try {
              const json = JSON.parse(raw);
              callback(json); // 把 chunk 传给外部
            } catch {
              /* 忽略无法解析的行 */
            }
          }
        }
        resolve(); // 兜底
      } catch (e: any) {
        reject(e);
      }
    };
    pump();
  });
}

/* ------------------ 使用示例 ------------------ */
if (import.meta.main) {
  await sendSse({
    url: 'https://api.gpt.ge/v1/chat/completions',
    token: '',
    payload: {
      model: "gpt-3.5-turbo",
      messages: [{role: "user", content: "你好"}]
    },
    event: "chat.completion",
    callback: (chunk) => {
      const token = chunk.choices?.[0]?.delta?.content;
      if (token) process.stdout.write(token);
    }

  });
  console.log("\n全部结束");
}