import { db } from "@/global/db";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";

const app = new Elysia();

app.delete(
  "delete/:id",
  async ({ params }) => {
    const { id } = params;
    await db.sql`delete from my_video_item where id = ${id}`;
    return Result.success();
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ["my/video-item"],
      summary: "删除我的视频",
      description: "删除我的视频",
    },
  }
);

export default app;
