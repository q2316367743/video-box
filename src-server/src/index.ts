import { Elysia } from "elysia";
// 插件
import { runMigrations } from "./plugins/migrate";
// 路由
import folderWebRoutes from "@/routers/folder-web";
import sourceWebRoutes from "@/routers/source-web";
import pluginWebRoutes from "@/routers/plugin-web";

const app = new Elysia();

app.use(folderWebRoutes).use(sourceWebRoutes).use(pluginWebRoutes);

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
