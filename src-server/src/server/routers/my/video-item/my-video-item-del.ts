import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";
import {myVideoItemDao} from "@/dao";

const app = new Elysia();

app.delete(
  "delete/:id",
  async ({ params }) => {
    const { id } = params;
    await myVideoItemDao.deleteById(id);
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
