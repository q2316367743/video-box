import { Elysia } from "elysia";
// 插件
import { logger } from "@rasla/logify";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";
import jwt from "@elysiajs/jwt";
// 拓展

export function registerElysiaPlugin(app: Elysia) {
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
        secret: process.env.ADMIN_JWT_SECRET || "123456",
        exp: "7d",
      })
    );
}
