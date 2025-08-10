import {Elysia, t} from "elysia";
import {sourceSubscribeDao, sourceSubscribeRecordDao} from "@/dao";
import {Result} from "@/views/Result";
import {pluginSubscribeRecordService} from "@/service/plugin/subscribe/PluginSubscribeRecordService";

export default new Elysia()
  .get("record/:id", async ({params, query}) => {
    const {id} = params;
    const {pageNum, pageSize} = query;

    const subscribe = await sourceSubscribeDao.selectById( id);
    if (!subscribe) return Result.fail("订阅源不存在");
    if (subscribe.cache === 0) {
      // 不缓存，现查
      return Result.success(pluginSubscribeRecordService(subscribe));
    }

    const page = await sourceSubscribeRecordDao.query()
      .eq('subscribe_id', id)
      .orderByDesc('pub_date')
      .page(pageNum, pageSize);
    return Result.success(page);
  }, {
    params: t.Object({
      id: t.String()
    }),
    query: t.Object({
      pageNum: t.Number({
        default: 1
      }),
      pageSize: t.Number({
        default: 10
      }),
    }),
  })