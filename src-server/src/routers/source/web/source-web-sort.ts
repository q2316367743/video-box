import { db } from "@/global/db";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";

const app = new Elysia();

app.put(
  "sort",
  async ({ body }) => {
    // 获取全部的源
    for (const element of body) {
      if (element.folder) {
        // 更新文件夹
        await db.sql`update folder_web set \`order\` = ${element.order} where id = ${element.id}`;
      } else {
        // 更新源
        await db.sql`update source_web set \`order\` = ${element.order} where id = ${element.id}`;
      }
    }
    return Result.success();
  },
  {
    body: t.Array(
      t.Object({
        id: t.String(),
        folder: t.Boolean(),
        order: t.Number(),
      })
    ),
  }
);

export default app;
