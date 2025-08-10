import {Elysia} from "elysia";
import adminRouters from "@/server/routers/admin";
import adminSetting from "@/server/routers/admin/setting";
import folderWebRoutes from "@/server/routers/folder/web";
import sourceWebRoutes from "@/server/routers/source/web";
import sourceTvRoutes from "@/server/routers/source/tv";
import sourceDiskRouters from "@/server/routers/source/disk";
import pluginWebRoutes from "@/server/routers/plugin/web";
import pluginDiskRouters from "@/server/routers/plugin/disk";
import pluginSubscribeRouters from '@/server/routers/plugin/subscribe';
import myVideoItemRoutes from "@/server/routers/my/video-item";
import proxyRoutes from "@/server/routers/proxy";
import authRoutes from "@/server/routers/auth";

export default new Elysia({prefix: "/api"})
  .use(adminRouters)
  .use(adminSetting)
  .use(folderWebRoutes)
  .use(sourceWebRoutes)
  .use(sourceTvRoutes)
  .use(sourceDiskRouters)
  .use(pluginWebRoutes)
  .use(pluginDiskRouters)
  .use(pluginSubscribeRouters)
  .use(myVideoItemRoutes)
  .use(proxyRoutes)
  .use(authRoutes);