import { Elysia, t } from "elysia";
import { getSourceWebInfo } from "../../source/web/source-web-info";
import { Result } from "@/views/Result";
import { buildWebPlugin } from "@/modules/web";
import { SourceWebView } from "@/types/SourceWeb";

const app = new Elysia();

app.get(
  "/list/:id",
  async ({ params, query }) => {
    // 网络资源ID
    const { id } = params;
    // 分页
    const { page, categoryId } = query;
    // 获取网络资源
    const data = await getSourceWebInfo(id);
    if (!data) return Result.error("网络资源不存在");
    // 构造插件
    const plugin = buildWebPlugin(data);
    const res = await plugin.getWebs(categoryId, page);
    return Result.success(res);
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    query: t.Object({
      categoryId: t.String(),
      page: t.Number(),
    }),
    detail: {
      tags: ["plugin/web"],
      summary: "获取网络插件列表",
      description: "获取网络插件列表",
    },
  }
);

export default app;
