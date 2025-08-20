import {Elysia, t} from "elysia";
import {sourceNewsContentDao, sourceNewsDao, sourceNewsRecordDao} from "@/dao";
import {Result} from "@/views/Result";

export default new Elysia()
  .get('info/:id', async ({params}) => {
    // 获取信息
    const row = await sourceNewsDao.selectById(params.id);
    if (!row) return Result.notFound();
    const content = await sourceNewsContentDao.query().eq('news_id', params.id).one();
    const records = await sourceNewsRecordDao.query().eq('news_id', params.id).orderByAsc('order').list();
    return Result.success({
      ...row,
      script: content?.script || '',
      records
    })
  }, {
    params: t.Object({
      id: t.String()
    })
  })