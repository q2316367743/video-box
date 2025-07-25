import { db } from "@/global/db";
import { SourceWeb, SourceWebView } from "@/types/SourceWeb";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";

const app = new Elysia();

export async function getSourceWebInfo(
  id: string
): Promise<SourceWebView | null> {
  const { rows } = await db.sql`select * from source_web where id = ${id}`;
  if (rows) {
    const row = rows[0];
    if (row) {
      return {
        ...(row as any as SourceWeb),
        props: JSON.parse(row.props as string),
        is_enabled: row.is_enabled !== 0,
      };
    }
  }
  return null;
}

// 查询详情
app.get(
  "/info/:id",
  async ({ params }) => {
    const { id } = params;
    const data = await getSourceWebInfo(id);
    if (data) return Result.success(data);
    return Result.error("未查询到详情");
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ["source/web"],
      summary: "查询网络资源详情",
      description: "查询网络资源详情",
    },
  }
);

export default app;
