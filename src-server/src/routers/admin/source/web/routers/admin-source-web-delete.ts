import {Elysia, t} from "elysia";
import {Result} from "@/views/Result";
import {deleteById} from "@/utils/SqlUtil";
import {sourceWebDao} from "@/dao";
// 子路由

const app = new Elysia();

// 删除
app.delete(
  "delete/:id",
  async ({params}) => {
    const {id} = params;
    await sourceWebDao.deleteById(id);
    return Result.success();
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ["source/web"],
      summary: "删除一个网络资源",
      description: "删除一个网络资源",
    },
  }
);

export default app;
