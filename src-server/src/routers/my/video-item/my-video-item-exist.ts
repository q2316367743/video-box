import { db } from "@/global/db";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";

const app = new Elysia();

app.get(
  "exist/:id",
  async ({ params }) => {
    const { id } = params;
    const { rows } =
      await db.sql`select count(1) as \`exist\` from my_video_item where id = ${id}`;
    return Result.success(rows && ((rows[0]["count"] as number) || 0) > 0);
  },
  {
    params: t.Object({
      id: t.String(),
    }),
  }
);

export default app;
