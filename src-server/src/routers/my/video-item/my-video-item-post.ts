import { db } from "@/global/db";
import { useSnowflake } from "@/utils/Snowflake";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";
import { buildId } from "./common";

const app = new Elysia();

app.post('post', async ({ body }) => {
  const { type, from, payload, cover, totle, description } = body;
  await db.sql`
  insert into my_video_item (id, type, from, payload, cover, totle, description)
  values (${buildId({ type, from, payload })}, ${type}, ${from}, ${payload}, ${cover}, ${totle}, ${description});
  `;
  return Result.success();
}, {
  body: t.Object({
    type: t.Number(),
    from: t.Number(),
    payload: t.String(),
    cover: t.String(),
    totle: t.String(),
    description: t.String(),
  })
})

export default app;
