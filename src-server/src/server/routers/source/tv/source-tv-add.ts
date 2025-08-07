import { db } from "@/global/db";
import { useSnowflake } from "@/utils/Snowflake";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";

const app = new Elysia();

app.post(
  "add",
  async ({ body }) => {
    const { name, url, timeout } = body;
    db.sql`insert into source_tv(id, name, url, timeout, refresh_time, refresh_status)
    values(${useSnowflake().nextId()}, ${name}, ${url}, ${timeout}, 0, 0);`;
    return Result.success();
  },
  {
    body: t.Object({
      name: t.String(),
      url: t.String(),
      // 默认禁用超时检测
      timeout: t.Integer({
        default: 1,
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
