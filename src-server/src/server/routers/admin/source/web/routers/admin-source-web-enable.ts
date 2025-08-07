import {Elysia, t} from "elysia";
import {Result} from "@/views/Result";
import {sourceWebDao} from "@/dao";

const app = new Elysia();

// 更新
app.put(
  "enable/:id",
  async ({params}) => {
    const {id} = params;
    try {
      const source = await sourceWebDao.selectById(id);
      if (!source) {
        return Result.error("资源不存在");
      }
      await sourceWebDao.updateById(id, {
        is_enabled: !source.is_enabled ? 1 : 0,
      });
      return Result.success();
    } catch (e) {
      return Result.error(e instanceof Error ? e.message : `${e}`);
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ["source/web"],
      summary: "启用/禁用一个网络资源",
      description: "启用/禁用一个网络资源",
    },
  }
);

export default app;
