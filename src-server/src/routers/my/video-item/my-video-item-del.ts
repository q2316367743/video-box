import { db } from "@/global/db";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";

const app = new Elysia();

app.delete(
  "delete/:id",
  async ({ params }) => {
    const { id } = params;
    await db.sql`delete from my_video_item where id = ${id}`;
    return Result.success();
  },
  {
    params: t.Object({
      id: t.String(),
    }),
  }
);

export default app;
