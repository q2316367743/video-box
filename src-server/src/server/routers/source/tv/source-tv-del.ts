import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";
import {sourceTvDao} from "@/dao";

const app = new Elysia();

app.delete(
  "delete/:id",
  async ({ params }) => {
    await sourceTvDao.deleteById(params.id);
    return Result.success();
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ["source/tv"],
      summary: "删除电视资源",
      description: "删除电视资源",
    },
  }
);

export default app;
