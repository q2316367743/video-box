import { db } from "@/global/db";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";

const app = new Elysia();

app.get("/list", async () => {
  const { rows } = await db.sql`select * from my_video_item`;
  return Result.success(rows || []);
}, {
  detail: {
    tags: ["my/video-item"],
    summary: "获取我的视频列表",
    description: "获取我的视频列表",
  },
});

export default app;
