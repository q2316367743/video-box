import { db } from "@/global/db";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";

const app = new Elysia();

// 查询详情
app.post(
  "move",
  async ({ body }) => {
    const { id, folder } = body;
    await db.sql`update source_web set folder = ${folder}, update_time = ${Date.now()} where id = ${id}`;
    return Result.success();
  },
  {
    body: t.Object({
      id: t.String(),
      folder: t.String(),
    }),
    detail: {
      tags: ["source/web"],
      summary: "移动网络资源",
      description: "移动网络资源",
    },
  }
);

export default app;
