import { db } from "@/global/db";
import { useSnowflake } from "@/utils/Snowflake";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";

const app = new Elysia();

app.post(
  "post",
  async ({ body }) => {
    const { type, from, payload, cover, title, description } = body;
    // 先查询是否存在
    const { rows } =
      await db.sql`select * from my_video_item where \`type\` = ${type} and \`from\` = ${from} and payload = ${payload}`;
    // 如果存在，则删除
    if (rows && rows.length > 0) {
      await db.sql`delete from my_video_item where id = ${rows[0].id}`;
    }
    // 插入新的插入
    await db.sql`
    insert into my_video_item (id, \`type\`, \`from\`, payload, cover, title, \`description\`)
    values (${useSnowflake().nextId()}, ${type}, ${from}, ${payload}, ${cover}, ${title}, ${description});
    `;
    return Result.success();
  },
  {
    body: t.Object({
      type: t.Number(),
      from: t.Number(),
      payload: t.String(),
      cover: t.String(),
      title: t.String(),
      description: t.String(),
    }),
  }
);

export default app;
