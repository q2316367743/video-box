import {Elysia} from "elysia";
import pluginDiskReadDir from "@/routers/plugin/disk/routers/PluginDiskReadDir";

export default new Elysia({prefix: '/api/plugin/disk'})
  .use(pluginDiskReadDir)