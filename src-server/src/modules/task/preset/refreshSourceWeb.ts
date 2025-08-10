import {TaskRunnerContext} from "@/modules/task/TaskRunner";
import {sourceWebDao} from "@/dao";
import {debug, error} from "@rasla/logify";
import {refreshSourceWeb} from "@/modules/web/func/RefreshSourceWeb";
import {SourceWeb} from "@/types/SourceWeb";

export default async function (ctx: TaskRunnerContext) {
  ctx.update(10)
  const rows = await sourceWebDao.query().lt("retry_count", 3).list();
  debug(`开始刷新网络资源，共${rows?.length}个`);
  if (rows.length === 0) {
    debug("没有要刷新的网络资源");
    return;
  }
  try {
    await Promise.all(
      rows.map(async (row, index) => {
        await refreshSourceWeb(row as any as SourceWeb)
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