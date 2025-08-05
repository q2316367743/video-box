import {Elysia} from "elysia";
// 路由
import folderWebRoutes from "@/routers/folder/web";
import sourceWebRoutes from "@/routers/source/web";
import sourceTvRoutes from "@/routers/source/tv";
import sourceDiskRouters from '@/routers/source/disk';
import pluginWebRoutes from "@/routers/plugin/web";
import pluginDiskRouters from '@/routers/plugin/disk';
import myVideoItemRoutes from "@/routers/my/video-item";
import proxyRoutes from "@/routers/proxy";
import authRoutes from "@/routers/auth";
import adminRouters from "@/routers/admin";
import adminSetting from "@/routers/admin/setting";

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
app
  .use(adminRouters)
  .use(adminSetting)
  .use(folderWebRoutes)
  .use(sourceWebRoutes)
  .use(sourceTvRoutes)
  .use(sourceDiskRouters)
  .use(pluginWebRoutes)
  .use(pluginDiskRouters)
  .use(myVideoItemRoutes)
  .use(proxyRoutes)
  .use(authRoutes);

elysiaInit()
  .finally(() => {
    app.listen(52411);
    console.log(
      `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}，当前运行环境${process.env.NODE_ENV}`
    );
  });
