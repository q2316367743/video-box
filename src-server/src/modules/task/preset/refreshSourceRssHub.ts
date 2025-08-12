import {TaskRunnerContext} from "@/modules/task/TaskRunner";
import {sourceSubscribeRssHubDao, sourceWebDao} from "@/dao";
import {debug, error} from "@rasla/logify";
import {useHead} from "@/global/http";

export default async function (ctx: TaskRunnerContext) {
  ctx.update(10)
  const rows = await sourceSubscribeRssHubDao.query().lt("retry_count", 3).list();
  debug(`开始刷新RSS Hub资源，共${rows?.length}个`);
  if (rows.length === 0) {
    debug("没有要刷新的RSS Hub资源");
    return;
  }
  try {
    await Promise.all(
      rows.map(async (row, index) => {
        try {
          const start = Date.now();
          await useHead(row.url);
          const end = Date.now();
          await sourceSubscribeRssHubDao.updateById(row.id, {
            updated_at: end,
            refresh_time: end,
            retry_count: 0,
            delay_time: end - start,
            is_enabled: 1,
          })
        }catch (e) {
          const now = Date.now();
          debug(`刷新「${row.name}」失败：${error}`);
          await sourceWebDao.updateById(row.id, {
            update_time: now,
            refresh_time: now,
            retry_count: row.retry_count + 1,
            is_enabled: row.is_enabled !== 0
              ? row.retry_count + 1 < 3
                ? 1
                : 0
              : row.is_enabled,
            delay_time: -1,
          })
        }
        ctx.update(index / rows.length * 80)
      })
    );
    ctx.update(95)
    debug("刷新网络资源完成");
  } catch (e) {
    error(
      "网络资源刷新失败，" + (e instanceof Error ? e.message : `${e}`)
    );
  }
}