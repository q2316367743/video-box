import { db } from "@/global/db";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";

const app = new Elysia();

app.get(
  "info/:id",
  async ({ params }) => {
    const { rows } =
      await db.sql`select * from source_tv where id = ${params.id}`;
    if (!rows) return Result.error("直播源不存在1");
    const row = rows[0];
    if (!row) return Result.error("直播源不存在2");
    // 查询全部的渠道
    const channels =
      await db.sql`select * from source_tv_channel where source_id = ${params.id}`;
    if (!channels.rows) return Result.error("直播源渠道不存在");
    return Result.success({
      ...row,
      channels: channels.rows,
    });
  },
  {
    params: t.Object({
      id: t.String(),
    }),
  }
);

export default app;
