import { Elysia, ValidationError } from "elysia";
import { logger, error as err } from "@rasla/logify";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";
import jwt from "@elysiajs/jwt";
// 插件
import { runMigrations } from "./plugins/migrate";
import { Result } from "./views/Result";
// 路由
import folderWebRoutes from "@/routers/folder/web";
import sourceWebRoutes from "@/routers/source/web";
import sourceTvRoutes from "@/routers/source/tv";
import pluginWebRoutes from "@/routers/plugin/web";
import myVideoItemRoutes from "@/routers/my/video-item";
import proxyRoutes from "@/routers/proxy";
import authRoutes from "@/routers/auth";

const app = new Elysia();

// 使用插件
app
  .use(
    logger({
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
      file: process.env.NODE_ENV === "production",
      filePath: "/app/video-box/logs",
    })
  )
  .use(
    staticPlugin({
      assets: "public",
      prefix: "/",
    })
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: "Video Box API",
          version: "1.0.0",
          description: "Video Box API documentation",
        },
        tags: [
          { name: "folder/web", description: "文件夹-网络资源" },
          { name: "source/web", description: "源-网络资源" },
          { name: "source/tv", description: "源-电视资源" },
          { name: "plugin/web", description: "插件-网络资源" },
          { name: "my/video-item", description: "我的-视频资源" },
          { name: "proxy", description: "代理" },
          { name: "auth", description: "认证" },
        ],
      },
    })
  )
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "123456",
      exp: "7d",
    })
  );

// 全局钩子
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

// 注册路由
app
  .use(folderWebRoutes)
  .use(sourceWebRoutes)
  .use(sourceTvRoutes)
  .use(pluginWebRoutes)
  .use(myVideoItemRoutes)
  .use(proxyRoutes)
  .use(authRoutes);

runMigrations()
  .then(() => {
    console.log("✅ migrations applied");
  })
  .catch((e) => {
    console.error("❌ migrations failed", e);
  })
  .finally(() => {
    app.listen(52411);
    console.log(
      `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
    );
  });
