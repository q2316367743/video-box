import { db } from "@/global/db";
import { runTask } from "@/modules/task/TaskRunner";
import { taskStore } from "@/modules/task/TaskStore";
import { refreshSourceWeb } from "@/modules/web/func/RefreshSourceWeb";
import { SourceWeb } from "@/types/SourceWeb";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";
import { sleep } from "radash";

const app = new Elysia();

app.get(
  "refresh/:id",
  async ({ params }) => {
    const { id } = params;
    const { rows } = await db.sql`select * from source_web where id = ${id}`;
    if (!rows || rows.length === 0) return Result.error("网络资源不存在");
    const sourceWeb = rows[0] as any as SourceWeb;

    // 判断是否已存在
    const exist = taskStore.has(`/source/web/delay/${id}`);
    if (!exist) {
      // 加入任务
      runTask(
        `刷新「${sourceWeb.title}」`,
        `/source/web/delay/${id}`,
        async () => {
          await refreshSourceWeb(sourceWeb);
        }
      );
    }
    // 等待任务完成
    while (taskStore.has(`/source/web/delay/${id}`)) {
      await sleep(1000);
    }
    return Result.success("刷新成功");
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ["source/web"],
      summary: "刷新网络资源",
      description: "刷新网络资源",
    },
  }
);

export default app;
