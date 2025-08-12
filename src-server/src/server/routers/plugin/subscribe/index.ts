import {Elysia} from "elysia";
import pluginSubscribeListRouter from "@/server/routers/plugin/subscribe/routers/PluginSubscribeListRouter";
import PluginSubscribeRecordRouter from "@/server/routers/plugin/subscribe/routers/PluginSubscribeRecordRouter";
import pluginSubscribeContentRouter from "@/server/routers/plugin/subscribe/routers/PluginSubscribeContentRouter";
import pluginSubscribeRefreshRouter from "@/server/routers/plugin/subscribe/routers/PluginSubscribeRefreshRouter";
import pluginSubscribeReadRouter from "@/server/routers/plugin/subscribe/routers/PluginSubscribeReadRouter";
import pluginSubscribeAddRouter from "@/server/routers/plugin/subscribe/routers/PluginSubscribeAddRouter";

export default new Elysia({prefix: '/plugin/subscribe'})
  // 查询一个展示类型下全部的订阅项
  .use(pluginSubscribeListRouter)
  // 分页查询一个订阅下的记录
  .use(PluginSubscribeRecordRouter)
  // 获取一个订阅的详情
  .use(pluginSubscribeContentRouter)
  // 强制刷新一个订阅记录
  .use(pluginSubscribeRefreshRouter)
  // 已读一个记录
  .use(pluginSubscribeReadRouter)
  // 添加一个订阅
  .use(pluginSubscribeAddRouter)