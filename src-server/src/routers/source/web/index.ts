import { Elysia, t } from "elysia";
import { db } from "@/global/db";
import { Result } from "@/views/Result";
// 子路由
import sourceWebInfo from "./source-web-info";
import sourceWebMove from "./source-web-move";
import sourceWebList from "./source-web-list";
import sourceWebSort from "./source-web-sort";
import sourceWebRefresh from "./source-web-refresh";

const app = new Elysia({ prefix: "/api/source/web" });

app
  .use(sourceWebInfo)
  .use(sourceWebMove)
  .use(sourceWebList)
  .use(sourceWebSort)
  .use(sourceWebRefresh);


// 更新
app.put(
  "update/:id",
  async ({ params, body }) => {
    const { id } = params;
    const { title, type, props, favicon, folder, order } = body;
    try {
      await db.sql`
  update source_web set title = ${title}, \`type\` = ${type}, props = ${JSON.stringify(
        props
      )}, favicon = ${favicon}, folder = ${folder}, \`order\` = ${order}
  where id = ${id};
  `;
      return Result.success();
    } catch (e) {
      return Result.error(e instanceof Error ? e.message : `${e}`);
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      title: t.String(),
      type: t.Number(),
      props: t.Record(t.String(), t.Any()),
      favicon: t.String(),
      folder: t.String(),
      order: t.Number(),
    }),
    detail: {
      tags: ["source/web"],
      summary: "更新一个网络资源",
      description: "更新一个网络资源",
    },
  }
);

export default app;
