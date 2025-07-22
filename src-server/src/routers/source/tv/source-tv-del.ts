import { db } from "@/global/db";
import { Elysia, t } from "elysia";

const app = new Elysia();

app.delete(
  "delete/:id",
  async ({ params }) => {
    db.sql`delete from source_tv where id = ${params.id}`;
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ["source/tv"],
      summary: "删除电视资源",
      description: "删除电视资源",
    },
  }
);

export default app;
