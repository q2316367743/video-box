import { Elysia, t } from "elysia";
import { db } from "@/global/db";
import { Result } from "@/views/Result";
// 子路由
import sourceWebHome from "./source-web-home";
import sourceWebImport from "./source-web-import";
import sourceWebInfo from "./source-web-info";
import sourceWebMove from "./source-web-move";
import sourceWebList from "./source-web-list";
import sourceWebSort from "./source-web-sort";

const app = new Elysia({ prefix: "/api/source/web" });

app
  .use(sourceWebHome)
  .use(sourceWebImport)
  .use(sourceWebInfo)
  .use(sourceWebMove)
  .use(sourceWebList)
  .use(sourceWebSort);

// 新增
app.post(
  "add",
  async ({ body }) => {
    const { title, type, props, favicon, folder, order } = body;
    try {
      await db.sql`
  insert into source_web (title, type, props, favicon, folder, order)
  values (${title}, ${type}, ${JSON.stringify(
        props
      )}, ${favicon}, ${folder}, ${order});
  `;
      return Result.success();
    } catch (e) {
      return Result.error(e instanceof Error ? e.message : `${e}`);
    }
  },
  {
    body: t.Object({
      title: t.String(),
      type: t.Number(),
      props: t.Record(t.String(), t.Any()),
      favicon: t.String(),
      folder: t.String(),
      order: t.Number(),
    }),
  }
);

// 删除
app.delete(
  "delete/:id",
  async ({ params }) => {
    const { id } = params;
    await db.sql`delete from source_web where id = ${id}`;
    return Result.success();
  },
  {
    params: t.Object({
      id: t.String(),
    }),
  }
);

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
  }
);

export default app;
