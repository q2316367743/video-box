import { db } from "@/global/db";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";
import { buildId } from "./common";

const app = new Elysia();

app.put(
  "toggle",
  async ({ body }) => {
    const { type, from, payload, cover, totle, description } = body;
    const id = buildId({ type, from, payload });
    // 如果存在记录则删除，不存在则新增
    const { rows } = await db.sql`select * from my_video_item where id = ${id}`;
    if (rows && rows.length > 0) {
      await db.sql`delete from my_video_item where id = ${id}`;
    } else {
      await db.sql`insert into my_video_item (id, type, from, payload, cover, totle, description) 
    values (${id}, ${type}, ${from}, ${payload}, ${cover}, ${totle}, ${description})`;
    }
    return Result.success();
  },
  {
    body: t.Object({
      type: t.Number(),
      from: t.Number(),
      payload: t.String(),
      cover: t.String(),
      totle: t.String(),
      description: t.String(),
    }),
  }
);

export default app;
