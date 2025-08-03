import {Elysia} from "elysia";
import pluginDiskList from "@/routers/plugin/disk/routers/PluginDiskList";
import pluginDiskGet from "@/routers/plugin/disk/routers/PluginDiskGet";
import pluginDiskRename from "@/routers/plugin/disk/routers/PluginDiskRename";
import pluginDiskTransfer from "@/routers/plugin/disk/routers/PluginDiskTransfer";

export default new Elysia({prefix: '/api/plugin/disk'})
  .use(pluginDiskList)
  .use(pluginDiskGet)
  .use(pluginDiskRename)
  .use(pluginDiskTransfer)