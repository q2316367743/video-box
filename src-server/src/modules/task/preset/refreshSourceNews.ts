import {SourceNews} from "@/types/SourceNews";
import {TaskRunnerContext} from "@/modules/task/TaskRunner";
import {sourceNewsContentDao, sourceNewsDao, sourceNewsRecordDao} from "@/dao";
import {info, error} from "@rasla/logify";
import {map} from "@/utils/ArrayUtil";
import {beginTransactional} from "@/utils/SqlUtil";
import {getNewsRecords} from "@/global/ScriptManage";

export async function refreshSourceNewsOne(row: SourceNews) {
  const content = await sourceNewsContentDao.query().eq('news_id', row.id).one();
  if (!content) return Promise.reject(new Error("资讯脚本不存在"));
  const records = await getNewsRecords(content.script)
  await beginTransactional(async () => {
    // 查询旧的资讯
    console.log('查询旧的资讯')
    const oldRecords = await sourceNewsRecordDao.query().eq('news_id', row.id).list();
    const oldRecordMap = map(oldRecords, 'url');
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const oldRecord = oldRecordMap.get(record.url);
      const now = Date.now();
      if (oldRecord) {
        // 更新
        console.log('更新', record.title)
        await sourceNewsRecordDao.updateById(oldRecord.id, {
          updated_at: now,
          title: record.title,
          hover: record.hover || '',
          date: record.date || '',
          tag: record.tag ? JSON.stringify(record.tag) : '',
          tip: record.tip || '',
          order: i
        });
      } else {
        // 新增
        console.log('新增', record.title)
        await sourceNewsRecordDao.insert({
          created_at: now,
          updated_at: now,
          news_id: row.id,
          title: record.title,
          url: record.url,
          read: 0,
          hover: record.hover || '',
          date: record.date || '',
          tag: record.tag ? JSON.stringify(record.tag) : '',
          tip: record.tip || '',
          order: i
        })
      }
    }
    if (oldRecordMap.size > 0) {
      // 多余的删除
      for (let [_url, record] of oldRecordMap) {
        console.log('多余的删除', record.title)
        await sourceNewsRecordDao.deleteById(record.id);
      }
    }
    // 更新自身
    await sourceNewsDao.updateById(row.id, {
      updated_at: Date.now(),
    })
  })

}

export default async function (ctx: TaskRunnerContext) {
  // 获取全部需要缓存的订阅源
  const news = await sourceNewsDao.query().eq('is_enabled', 1).list();
  info(`获取全部需要缓存的订阅源，共有${news.length}个`)

  for (let i = 0; i < news.length; i++) {
    try {
      ctx.update(i / news.length);
      await refreshSourceNewsOne(news[i]);
    } catch (e) {
      console.error(e);
      error(`处理「${news[i].title}」失败：${e}`)
    }
  }
  info("处理完成")
}