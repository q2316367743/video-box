import {TaskRunnerContext} from "@/modules/task/TaskRunner";
import {sourceWebDao} from "@/dao";
import {debug, error} from "@rasla/logify";
import {refreshSourceWeb} from "@/modules/web/func/RefreshSourceWeb";
import {SourceWeb} from "@/types/SourceWeb";

export default async function (ctx: TaskRunnerContext) {
  const rows = await sourceWebDao.query().lt("refresh_time", 3).list();
  debug(`开始刷新网络资源，共${rows?.length}个`);
  if (rows.length === 0) {
    debug("没有要刷新的网络资源");
    return;
  }
  try {
    await Promise.all(
      rows.map((row) => refreshSourceWeb(row as any as SourceWeb))
    );
    debug("刷新网络资源完成");
  } catch (e) {
    error(
      "网络资源刷新失败，" + (e instanceof Error ? e.message : `${e}`)
    );
  }
}