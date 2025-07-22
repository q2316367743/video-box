import { db } from "@/global/db";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";

const app = new Elysia();

app.get(
  "exist",
  async ({ query }) => {
    const { type, from, payload } = query;
    const { rows } =
      await db.sql`select * from my_video_item where \`type\` = ${type} and \`from\` = ${from} and payload = ${payload}`;
    return Result.success(rows && rows.length > 0);
  },
  {
    query: t.Object({
      type: t.String(),
      from: t.String(),
      payload: t.String(),
    }),
    detail: {
      tags: ["my/video-item"],
      summary: "判断我的视频是否存在",
      description: "判断我的视频是否存在",
    },
  }
);

export default app;
