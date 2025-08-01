import {Elysia} from "elysia";
import pluginDiskList from "@/routers/plugin/disk/routers/PluginDiskList";
import pluginDiskGet from "@/routers/plugin/disk/routers/PluginDiskGet";

export default new Elysia({prefix: '/api/plugin/disk'})
  .use(pluginDiskList)
  .use(pluginDiskGet)