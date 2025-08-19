import {Elysia, t} from "elysia";
import {sourceNewsContentDao, sourceNewsDao, sourceNewsRecordDao} from "@/dao";
import {SourceNewsType} from "@/types/SourceNews";
import {refreshSourceNewsOne} from "@/modules/task/preset/refreshSourceNews";
import {Result} from "@/views/Result";

export default new Elysia()
  .delete('delete/:id', async ({params}) => {
    // 删除本身
    await sourceNewsDao.deleteById(params.id);
    // 删除脚本
    await sourceNewsContentDao.query().eq('news_id', params.id).delete();
    // 删除记录
    await sourceNewsRecordDao.query().eq('news_id', params.id).delete();
    return Result.success();
  }, {
    params: t.Object({
      id: t.String(),
    }),
  })