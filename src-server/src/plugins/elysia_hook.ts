import { Elysia, ValidationError } from "elysia";
// 插件
import { error as err } from "@rasla/logify";
// 拓展
import { Result } from "@/views/Result";

export function registerElysiaHook(app: Elysia) {
  app
  .onAfterHandle(({ response }) => {
    if (response instanceof Result) {
      return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" },
      });
    }
    // 如果不是 Result 实例，保持原样返回
    return response;
  })
  .onError(({ status, error, set }) => {
    // 设为正常
    set.status = 200;
    console.log(error)
    // 打印错误
    err("onError: " + JSON.stringify(error));
    return new Response(
      error instanceof Result
        ? JSON.stringify(error)
        : JSON.stringify(
            new Result(
              typeof status === "number" ? status : 500,
              error instanceof ValidationError
                ? "ValidationError"
                : error instanceof Error
                ? error.message
                : `${error}`,
              error
            )
          ),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  })
  // @ts-ignore
  .onRequest(async ({ jwt, request }) => {
    // 只拦截 /api/ 开头的路径
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return;
    if (url.pathname.startsWith("/api/auth")) return;

    const token = request.headers.get("authorization");
    if (!token) {
      err("onRequest: not auth");
      return new Response(JSON.stringify(Result.notAuth()), {
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      await jwt.verify(token);
    } catch (e) {
      err("onRequest: token expired");
      err(JSON.stringify(e));
      return new Response(JSON.stringify(Result.tokenExpired()), {
        headers: { "Content-Type": "application/json" },
      });
    }
  });
}
