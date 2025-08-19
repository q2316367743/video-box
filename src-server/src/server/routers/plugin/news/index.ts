import {Elysia, t} from "elysia";
import {sourceNewsDao, sourceNewsRecordDao} from "@/dao";
import {Result} from "@/views/Result";
import {group} from "@/utils/ArrayUtil";
import {refreshSourceNewsOne} from "@/modules/task/preset/refreshSourceNews";
import {runAsyncTempTask} from "@/modules/task/TempTaskRunner";

export default new Elysia({prefix: '/plugin/news'})
  .get('list', async () => {
    // 查询启用的资讯
    const news = await sourceNewsDao.query().eq('is_enabled', 1).orderByAsc('order').list();
    if (news.length === 0) return Result.success([]);
    // 根据资讯ID查询资讯记录
    const records = await sourceNewsRecordDao.query().in('news_id', news.map(item => item.id)).list();
    const recordMap = group(records, 'news_id');
    return Result.success(news.map(item => ({
      ...item,
      records: recordMap.getOrDefault(item.id, []).sort((a, b) => a.order - b.order)
    })))
  })
  .get('info/:id', async ({params}) => {
    // 查询启用的资讯
    const item = await sourceNewsDao.selectById(params.id);
    // 根据资讯ID查询资讯记录
    const records = await sourceNewsRecordDao.query().eq('news_id', params.id).list();
    return Result.success({
      ...item,
      records
    })
  })
  .put('refresh/:id', async ({params}) => {
    const row = await sourceNewsDao.selectById(params.id);
    if (!row) return Result.fail('资讯不存在');
    await runAsyncTempTask(`刷新「${row.title}」资讯列表`, `/source/news/record/${row.id}`, async () => {
      await refreshSourceNewsOne(row);
    });
    return Result.success('刷新成功');
  }, {
    params: t.Object({
      id: t.String()
    })
  })