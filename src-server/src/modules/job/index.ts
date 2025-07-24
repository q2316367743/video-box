import { Elysia } from "elysia";
import { debug, error } from "@rasla/logify";
import { cron } from "@elysiajs/cron";
import { db } from "@/global/db";
import { refreshSourceWeb } from "@/modules/web/func/RefreshSourceWeb";
import { SourceWeb } from "@/types/SourceWeb";

export function registerJob(app: Elysia) {
  app.use(
    cron({
      name: "sourceWebDelay",
      // 每10分钟执行一次
      pattern: "*/10 * * * *",
      async run() {
        const { rows } =
          await db.sql`select * from source_web where retry_count < 3;`;
        debug(`开始刷新网络资源，共${rows?.length}个`);
        if (!rows) return;
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
      },
    })
  );
}
