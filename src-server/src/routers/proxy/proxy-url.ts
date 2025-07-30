import {Elysia, t} from "elysia";
import {debug} from "@rasla/logify";
import http from 'http';
import https from 'https';
import {URL} from 'url';

const shake = (
  obj: Record<string, any>,
  filter?: (value: any) => boolean
): Record<string, string> => {
  if (!filter) {
    filter = e => e === undefined
  }
  if (!obj) return {}
  const keys = Object.keys(obj)
  return keys.reduce((acc, key) => {
    if (filter(obj[key])) {
      return acc
    } else {
      acc[key] = obj[key]
      return acc
    }
  }, {} as Record<string, any>)
}

const app = new Elysia();

app.get(
  "url/:url",
  async ({params, set, headers, request}) => {
    const {url} = params;


    // 解析协议、主机、端口、路径
    const link = new URL(url);
    const isHttps = link.protocol === 'https:';

    const {signal} = request;

    // 返回一个真正的 ReadableStream
    return new Response(
      new ReadableStream({
        start(controller) {
          debug('开始请求，协议: ' + link.protocol)
          const client = (isHttps ? https : http).request(link, {
                // 设置请求头
                headers: shake({
                  // 接收range头，以便支持断点续传
                  range: headers.range,
                  // 接收user-agent头，以便伪装成浏览器
                  'user-agent': headers['user-agent'],
                  // 接收referer头，以便伪装成浏览器
                  referer: headers.referer,
                  // 接收accept-encoding头，以便支持gzip压缩
                  'accept-encoding': headers['accept-encoding'],
                  // 接收accept-language头，以便支持多语言
                  'accept-language': headers['accept-language'],
                  // 接收pragma头，以便支持缓存
                  pragma: headers.pragma,
                  // 接收accept头，以便支持多种类型
                  accept: headers.accept,
                })
              }, (res) => {
                // 把下游响应头透传
                debug("把下游响应头透传")
                const downstreamHeaders: Record<string, string> = {};
                for (const [k, v] of Object.entries(res.headers)) {
                  if (v !== undefined) downstreamHeaders[k] = Array.isArray(v) ? v.join(', ') : v;
                }
                // 这里如果想把状态码也透传，需要 Elysia 的 set.status，但 Response 构造器里不能改
                // 所以干脆让 Elysia 按 200 返，或者你可以用 res.statusCode 设置 set.status
                res.on('data', (chunk) => controller.enqueue(chunk));
                res.on('end', () => controller.close());
                res.on('error', (e) => controller.error(e));
              }
            )
          ;

          client.on('error', (e) => controller.error(e));
          client.end(); // 发送请求

          // 浏览器或前端断开时会触发 cancel
          signal.addEventListener('abort', () => {
            debug("浏览器或前端断开时")
            client.destroy(); // 立即断开与目标服务器的连接
          });
        },
      }),
      {
        // 可选：把下游 Content-Type 等头塞进来
        headers: {},
      }
    );

  },
  {
    params: t.Object({
      url: t.String(),
    }),
    detail: {
      tags: ["proxy"],
      summary: "http请求",
      description: "代理url的请求，解决前端跨域问题",
    },
  }
);

export default app;
