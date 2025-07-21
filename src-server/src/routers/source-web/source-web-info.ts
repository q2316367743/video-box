import { db } from "@/global/db";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";

const app = new Elysia();

// 查询详情
app.get(
  "/info/:id",
  async ({ params }) => {
    const { id } = params;
    const { rows } = await db.sql`select * from source_web where id = ${id}`;
    if (rows) {
      const row = rows[0];
      if (row) {
        return Result.success({
          ...row,
          props: JSON.parse(row.props as string),
        });
      }
    }
    return Result.error("未查询到详情");
  },
  {
    params: t.Object({
      id: t.String(),
    }),
  }
);

export default app;
