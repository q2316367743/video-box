import {Elysia} from "elysia";
import pluginDiskReadDir from "@/routers/plugin/disk/routers/PluginDiskReadDir";
import pluginDiskLink from "@/routers/plugin/disk/routers/PluginDiskLink";

export default new Elysia({prefix: '/api/plugin/disk'})
  .use(pluginDiskReadDir)
  .use(pluginDiskLink)