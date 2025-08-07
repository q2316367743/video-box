import {Result} from "@/views/Result";
import {Elysia} from "elysia";
import {sourceTvDao} from "@/dao";

const app = new Elysia();

app.get(
  "list",
  async () => {
    const rows = await sourceTvDao.query().list();
    return Result.success(rows);
  },
  {
    detail: {
      tags: ["source/tv"],
      summary: "获取电视资源列表",
      description: "获取电视资源列表",
    },
  }
);

export default app;
