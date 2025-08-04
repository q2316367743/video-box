import {Elysia} from "elysia";
import pluginDiskList from "@/routers/plugin/disk/routers/PluginDiskList";
import pluginDiskGet from "@/routers/plugin/disk/routers/PluginDiskGet";
import pluginDiskRename from "@/routers/plugin/disk/routers/PluginDiskRename";
import pluginDiskTransfer from "@/routers/plugin/disk/routers/PluginDiskTransfer";
import pluginDiskMkdirRouter from "@/routers/plugin/disk/routers/PluginDiskMkdirRouter";
import pluginDiskRmRouter from "@/routers/plugin/disk/routers/PluginDiskRmRouter";
import pluginDiskUploadRouter from "@/routers/plugin/disk/routers/PluginDiskUploadRouter";

export default new Elysia({prefix: '/api/plugin/disk'})
  .use(pluginDiskList)
  .use(pluginDiskGet)
  .use(pluginDiskRename)
  .use(pluginDiskTransfer)
  .use(pluginDiskMkdirRouter)
  .use(pluginDiskRmRouter)
  .use(pluginDiskUploadRouter)