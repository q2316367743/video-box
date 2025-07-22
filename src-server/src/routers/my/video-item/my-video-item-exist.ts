import { db } from "@/global/db";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";

const app = new Elysia();

app.get(
  "exist",
  async ({ params }) => {
    const { type, from, payload } = params;
    const { rows } =
      await db.sql`select * from my_video_item where type = ${type} and from = ${from} and payload = ${payload}`;
    return Result.success(rows && rows.length > 0);
  },
  {
    params: t.Object({
      type: t.String(),
      from: t.String(),
      payload: t.String(),
    }),
  }
);

export default app;
