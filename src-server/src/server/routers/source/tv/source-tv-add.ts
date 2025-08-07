import {Result} from "@/views/Result";
import {Elysia, t} from "elysia";
import {sourceTvDao} from "@/dao";

const app = new Elysia();

app.post(
  "add",
  async ({body}) => {
    const {name, url, timeout} = body;
    await sourceTvDao.insert({
      name, url, timeout, refresh_status:0, refresh_time:0
    })
    return Result.success();
  },
  {
    body: t.Object({
      name: t.String(),
      url: t.String(),
      // 默认禁用超时检测
      timeout: t.Integer({
        default: 1,
      }),
    }),
    detail: {
      tags: ["source/tv"],
      summary: "添加电视资源",
      description: "添加电视资源",
    },
  }
);

export default app;
