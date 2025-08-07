import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";
import {myVideoItemDao} from "@/dao";

const app = new Elysia();

app.get(
  "exist",
  async ({ query }) => {
    const { type, from, payload } = query;
    const rows = await myVideoItemDao.query()
      .eq('type', type)
      .eq('from', from)
      .eq('payload', payload)
      .list();
    return Result.success( rows.length > 0);
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
