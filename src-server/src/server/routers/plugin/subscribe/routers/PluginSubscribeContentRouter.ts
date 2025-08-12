import {Elysia, t} from "elysia";
import {sourceSubscribeContentDao, sourceSubscribeDao, sourceSubscribeMediaDao, sourceSubscribeRecordDao} from "@/dao";
import {Result} from "@/views/Result";

export default new Elysia()
  .get('content/:id', async ({params}) => {
    const {id} = params;
    const record = await sourceSubscribeRecordDao.selectById(id);
    if (!record) return Result.fail("记录不存在");
    const subscribe = await sourceSubscribeDao.selectById(record.subscribe_id);
    if (!subscribe) return Result.fail("订阅不存在");
    const content = await sourceSubscribeContentDao.query().eq('record_id', record.id).one();
    // 媒体资源
    const media = await sourceSubscribeMediaDao.query().eq('record_id', record.id).list();
    return Result.success({
      ...record,
      content,
      media
    })
  }, {
    params: t.Object({
      id: t.String()
    })
  })