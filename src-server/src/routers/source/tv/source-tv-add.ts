import { db } from "@/global/db";
import { useSnowflake } from "@/utils/Snowflake";
import { Elysia, t } from "elysia";

const app = new Elysia();

app.post(
  "add",
  async ({ body }) => {
    const { name, url, timeout } = body;
    db.sql`insert into source_tv(id, name, url, timeout) 
    values(${useSnowflake().nextId()}, ${name}, ${url}, ${timeout ? 1 : 0});`;
  },
  {
    body: t.Object({
      name: t.String(),
      url: t.String(),
      // 默认禁用超时检测
      timeout: t.Boolean({
        default: false,
      }),
    }),
    detail: {
      tags: ["source/tv"],
      summary: "添加电视资源",
      description: "添加电视资源",
    },
  }
);

export default app;
