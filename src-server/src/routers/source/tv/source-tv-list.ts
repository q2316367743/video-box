import { db } from "@/global/db";
import { Result } from "@/views/Result";
import { Elysia } from "elysia";

const app = new Elysia();

app.get(
  "list",
  async () => {
    const { rows } = await db.sql`select * from source_tv`;
    return Result.success(rows || []);
  },
  {
    detail: {
      tags: ["source/tv"],
      summary: "获取电视资源列表",
      description: "获取电视资源列表",
    },
  }
);

export default app;
