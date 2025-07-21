import { Elysia, t } from "elysia";
import { db } from "@/global/db";
import { WebItemView } from "@/views/WebItemView";
import { Folder } from "@/types/Folder";
import { SourceWeb } from "@/types/SourceWeb";
import { Result } from "@/views/Result";
// 子路由
import sourceWebImport from "./source-web-import";
import sourceWebInfo from "./source-web-info";
import sourceWebMove from "./source-web-move";

const app = new Elysia({ prefix: "/api/source/web" });

app.use(sourceWebImport).use(sourceWebInfo).use(sourceWebMove);

// 查询首页
app.get(
  "home/:folder",
  async ({ params }) => {
    const { folder } = params;
    const views = new Array<WebItemView>();
    if (folder === "0") {
      const { rows: folders } = await db.sql`select * from folder_web`;
      if (folders) {
        (folders as Array<any> as Array<Folder>).forEach((f) => {
          views.push({
            id: f.id,
            name: f.name,
            cover: "",
            folder: true,
            order: f.order,
          });
        });
      }
    }
    let files: Array<SourceWeb> = [];
    if (folder === "0") {
      // 根目录
      // 查询源
      const { rows } = await db.sql`
      select * from source_web
      where folder = '0'
      or folder not in (select id from folder_web);
      `;
      if (rows) {
        files = rows as Array<any>;
      }
    } else {
      // 指定目录
      const { rows } =
        await db.sql`select * from source_web where folder = ${folder};`;
      if (rows) {
        files = rows as Array<any>;
      }
    }
    files.forEach((f) => {
      views.push({
        id: f.id,
        name: f.title,
        cover: "",
        folder: false,
        order: f.order,
      });
    });
    views.sort((a, b) => b.order - a.order);
    return Result.success(views);
  },
  {
    params: t.Object({
      folder: t.String(),
    }),
  }
);

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
