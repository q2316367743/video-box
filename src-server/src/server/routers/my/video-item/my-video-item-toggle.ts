import { db } from "@/global/db";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";
import { useSnowflake } from "@/utils/Snowflake";

const app = new Elysia();

app.put(
  "toggle",
  async ({ body }) => {
    const { type, from, payload, cover, title, description } = body;
    // 如果存在记录则删除，不存在则新增
    const { rows } =
      await db.sql`select * from my_video_item where \`type\` = ${type} and \`from\` = ${from} and payload = ${payload}`;
    if (rows && rows.length > 0) {
      await db.sql`delete from my_video_item where \`id\` = ${rows[0].id}`;
    } else {
      await db.sql`insert into my_video_item (id, \`type\`, \`from\`, payload, cover, title, \`description\`) 
    values (${useSnowflake().nextId()}, ${type}, ${from}, ${payload}, ${cover}, ${title}, ${description})`;
    }
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
    detail: {
      tags: ["my/video-item"],
      summary: "切换我的视频",
      description: "切换我的视频",
    },
  }
);

export default app;
