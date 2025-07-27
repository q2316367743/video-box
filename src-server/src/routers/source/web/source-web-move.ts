import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";
import {sourceWebDao} from "@/dao";

const app = new Elysia();

// 查询详情
app.post(
  "move",
  async ({ body }) => {
    const { id, folder } = body;
    await sourceWebDao.updateById(id, {update_time: Date.now(), folder});
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
