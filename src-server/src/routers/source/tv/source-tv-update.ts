import { db } from "@/global/db";
import { Elysia, t } from "elysia";

const app = new Elysia();

app.put(
  "update/:id",
  async ({ params, body }) => {
    const { id } = params;
    const { name, url, timeout } = body;
    db.sql`update source_tv set name = ${name}, url = ${url}, timeout = ${
      timeout ? 1 : 0
    } where id = ${id};`;
  },
  {
    params: t.Object({
      id: t.String(),
    }),
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
      summary: "更新电视资源",
      description: "更新电视资源",
    },
  }
);

export default app;
