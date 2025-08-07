import {Elysia, t} from "elysia";
import {debug, error} from "@rasla/logify";
import http from 'http';
import https from 'https';
import {URL} from 'url';
import {Result} from "@/views/Result";
import {shake} from "@/utils/lang/RecordUtil";

const app = new Elysia();

app.get(
  "url/:filename",
  async ({query, headers, request}) => {
    const {url} = query;


    // 解析协议、主机、端口、路径
    const link = new URL(url);
    if (link.protocol !== 'http:' && link.protocol !== 'https:') {
      return new Response(JSON.stringify(Result.error("不支持的协议")), {
        status: 400,
        statusText: '不支持的协议'
      })
    }
    const isHttps = link.protocol === 'https:';

    const {signal} = request;

    // 返回一个真正的 ReadableStream
    return new Promise<Response>((resolve, reject) => {

      const client = isHttps ? https : http;
      const upstream = client.request(link, {
        headers: shake(headers)
      }, (res) => {
        debug("请求成功");
        // 1. 收集远端响应头
        const headers = new Headers();
        for (const [key, value] of Object.entries(res.headers)) {
          if (Array.isArray(value)) {
            value.forEach(v => headers.append(key, v));
          } else if (value) {
            headers.set(key, value);
          }
        }

        // 2. 构造 ReadableStream 并返回 Response
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            res.on('data', (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
            res.on('end', () => controller.close());
            res.on('error', (err) => {
              controller.error(err);
              // 请求失败
              reject(err);
            });

            // 前端断开 → 销毁远端 socket
            signal.addEventListener('abort', () => {
              error("前端断开连接，销毁请求");
              upstream.destroy();
            });
          },
        });

        resolve(new Response(stream, {status: res.statusCode, headers}));
      })

    });

  },
  {
    params: t.Object({
      filename: t.String(),
    }),
    query: t.Object({
      url: t.String()
    }),
    detail: {
      tags: ["proxy"],
      summary: "http请求",
      description: "代理url的请求，解决前端跨域问题",
    },
  }
);

export default app;
