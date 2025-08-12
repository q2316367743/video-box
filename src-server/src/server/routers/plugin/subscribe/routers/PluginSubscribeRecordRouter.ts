import {Elysia, t} from "elysia";
import {sourceSubscribeDao, sourceSubscribeRecordDao} from "@/dao";
import {Result} from "@/views/Result";

export default new Elysia()
  .get("record/:display/:id", async ({params, query}) => {
    const {display, id} = params;
    const {pageNum, pageSize} = query;

    if (id === 'all') {
      // 查询全部订阅源的记录
      const sub = await sourceSubscribeDao.query().eq('display', Number(display)).select('id').list();
      const page = await sourceSubscribeRecordDao.query()
        .in('subscribe_id', sub.map(item => item.id))
        .orderByDesc('pub_date')
        .page(pageNum, pageSize);
      return Result.success(page);
    }

    const subscribe = await sourceSubscribeDao.selectById(id);
    if (!subscribe) return Result.fail("订阅源不存在");

    const page = await sourceSubscribeRecordDao.query()
      .eq('subscribe_id', id)
      .orderByDesc('pub_date')
      .page(pageNum, pageSize);
    return Result.success(page);
  }, {
    params: t.Object({
      id: t.String(),
      display: t.String(),
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