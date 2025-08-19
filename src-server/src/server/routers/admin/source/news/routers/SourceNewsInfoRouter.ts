import {Elysia, t} from "elysia";
import {sourceNewsContentDao, sourceNewsDao} from "@/dao";
import {Result} from "@/views/Result";

export default new Elysia()
  .get('info/:id', async ({params}) => {
    // 获取信息
    const row = await sourceNewsDao.selectById(params.id);
    if (!row) return Result.notFound();
    const content = await sourceNewsContentDao.query().eq('news_id', params.id).one();
    return Result.success({
      ...row,
      script: content?.script || ''
    })
  }, {
    params: t.Object({
      id: t.String()
    })
  })