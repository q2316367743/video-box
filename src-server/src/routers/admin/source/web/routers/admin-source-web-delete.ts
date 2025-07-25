import { Elysia, t } from "elysia";
import { Result } from "@/views/Result";
import { deleteById } from "@/utils/SqlUtil";
// 子路由

const app = new Elysia();

// 删除
app.delete(
  "delete/:id",
  async ({ params }) => {
    const { id } = params;
    deleteById('source_web', id);
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
