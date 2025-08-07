import {Elysia} from "elysia";
import pluginDiskList from "@/server/routers/plugin/disk/routers/PluginDiskList";
import pluginDiskGet from "@/server/routers/plugin/disk/routers/PluginDiskGet";
import pluginDiskRename from "@/server/routers/plugin/disk/routers/PluginDiskRename";
import pluginDiskTransfer from "@/server/routers/plugin/disk/routers/PluginDiskTransfer";
import pluginDiskMkdirRouter from "@/server/routers/plugin/disk/routers/PluginDiskMkdirRouter";
import pluginDiskRmRouter from "@/server/routers/plugin/disk/routers/PluginDiskRmRouter";
import pluginDiskUploadRouter from "@/server/routers/plugin/disk/routers/PluginDiskUploadRouter";
import pluginDiskBrother from "@/server/routers/plugin/disk/routers/PluginDiskBrother";

export default new Elysia({prefix: '/plugin/disk'})
  .use(pluginDiskList)
  .use(pluginDiskGet)
  .use(pluginDiskRename)
  .use(pluginDiskTransfer)
  .use(pluginDiskMkdirRouter)
  .use(pluginDiskRmRouter)
  .use(pluginDiskUploadRouter)
  .use(pluginDiskBrother)