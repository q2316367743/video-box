import {Elysia, t} from "elysia";
import {sourceSubscribeDao, sourceSubscribeMediaDao, sourceSubscribeRecordDao} from "@/dao";
import {Result} from "@/views/Result";
import {PageResponse} from "@/modules/database/QueryChain";
import {SourceSubscribeRecord} from "@/types/SourceSubscribe";
import {group, map} from "@/utils/ArrayUtil";

export default new Elysia()
  .get("record/:display/:id", async ({params, query}) => {
    const {display, id} = params;
    const {pageNum, pageSize} = query;

    let page: PageResponse<SourceSubscribeRecord>;
    if (id === 'all') {
      // 查询全部订阅源的记录
      const sub = await sourceSubscribeDao.query().eq('display', Number(display)).select('id').list();
      page = await sourceSubscribeRecordDao.query()
        .in('subscribe_id', sub.map(item => item.id))
        .orderByDesc('pub_date')
        .page(pageNum, pageSize);
    } else {
      const subscribe = await sourceSubscribeDao.selectById(id);
      if (!subscribe) return Result.fail("订阅源不存在");
      page = await sourceSubscribeRecordDao.query()
        .eq('subscribe_id', id)
        .orderByDesc('pub_date')
        .page(pageNum, pageSize);
    }

    const {records} = page;

    if (records.length === 0) {
      return Result.success(page);
    }

    // 媒体
    const medias = await sourceSubscribeMediaDao.query().in('record_id', records.map(e => e.id))
      .list();
    const mediaMap = group(medias, 'record_id');
    const subscribes = await sourceSubscribeDao.query()
      .in('id', Array.from(new Set(records.map(e => e.subscribe_id)))).list();
    const subscribeMap = map(subscribes, 'id');

    return Result.success({
      ...page,
      records: records.map(r => ({
        ...r,
        medias: mediaMap.getOrDefault(r.id, []),
        subscribe: subscribeMap.get(r.subscribe_id)
      }))
    });

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