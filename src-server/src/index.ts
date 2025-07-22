import { Elysia } from "elysia";
// 插件
import { runMigrations } from "./plugins/migrate";
import { Result } from "./views/Result";
// 路由
import folderWebRoutes from "@/routers/folder/web";
import sourceWebRoutes from "@/routers/source/web";
import sourceTvRoutes from "@/routers/source/tv";
import pluginWebRoutes from "@/routers/plugin/web";
import myVideoItemRoutes from "@/routers/my/video-item";

const app = new Elysia();

// 全局 afterHandle 钩子
app.onAfterHandle(({ response }) => {
  if (response instanceof Result) {
    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
    });
  }
  // 如果不是 Result 实例，保持原样返回
  return response;
});

app
  .use(folderWebRoutes)
  .use(sourceWebRoutes)
  .use(sourceTvRoutes)
  .use(pluginWebRoutes)
  .use(myVideoItemRoutes);

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
