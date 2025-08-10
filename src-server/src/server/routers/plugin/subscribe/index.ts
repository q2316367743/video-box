import {Elysia} from "elysia";
import PluginSubscribeGroupRouter from "@/server/routers/plugin/subscribe/routers/PluginSubscribeGroupRouter";
import pluginSubscribeListRouter from "@/server/routers/plugin/subscribe/routers/PluginSubscribeListRouter";
import PluginSubscribeRecordRouter from "@/server/routers/plugin/subscribe/routers/PluginSubscribeRecordRouter";

export default new Elysia({prefix: '/api/plugin/subscribe'})
  .use(PluginSubscribeGroupRouter)
  .use(pluginSubscribeListRouter)
  .use(PluginSubscribeRecordRouter)