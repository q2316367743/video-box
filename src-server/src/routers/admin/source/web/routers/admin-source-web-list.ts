import { selectList } from "@/utils/SqlUtil";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";

const app = new Elysia();

/**
 * 查询列表
 */
app.get(
  "list",
  async ({ query }) => {
    const { is_enabled } = query;
    const list = await selectList("source_web", { is_enabled });
    list.sort((a, b) => b.order - a.order);
    return Result.success(
      list.map((e) => ({
        ...e,
        props: JSON.parse(e.props),
        is_enabled: e.is_enabled !== 0,
      }))
    );
  },
  {
    detail: {
      tags: ["source/web"],
      summary: "查询网络资源列表",
      description: "查询网络资源列表",
    },
  }
);

export default app;
