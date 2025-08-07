import {Elysia} from "elysia";
// 路由
import apiRouter from "@/server/routers";
import webDavRouter from '@/server/webdav';

import {registerElysiaPlugin} from "./plugins/elysia_plugin";
import {registerElysiaHook} from "./plugins/elysia_hook";
import {elysiaInit} from "@/plugins/elysia_init";

const app = new Elysia({
  serve: {
    idleTimeout: 30,
  }
});

// 注册插件
registerElysiaPlugin(app);
// 全局钩子
registerElysiaHook(app);

// 注册路由
app.use(apiRouter).use(webDavRouter);

elysiaInit()
  .finally(() => {
    app.listen(52411);
    console.log(
      `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}，当前运行环境${process.env.NODE_ENV}`
    );
  });
