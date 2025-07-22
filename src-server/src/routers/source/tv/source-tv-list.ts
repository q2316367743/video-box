import { db } from "@/global/db";
import { Result } from "@/views/Result";
import { Elysia } from "elysia";

const app = new Elysia();

app.get("list", async () => {
  const { rows } = await db.sql`select * from source_tv`;
  return Result.success(rows || []);
});

export default app;
