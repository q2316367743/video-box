import { db } from "@/global/db";
import { SourceWeb } from "@/types/SourceWeb";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";

const app = new Elysia();

/**
 * 查询列表
 * root-根目录
 * all-全部
 * 其他-指定目录
 */
app.get(
  "list/:folder",
  async ({ params }) => {
    const { folder } = params;
    const views = new Array<SourceWeb>();
    let files: Array<SourceWeb> = [];
    if (folder === "root") {
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
    } else if (folder === "all") {
      // 全部
      const { rows } = await db.sql`select * from source_web`;
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
      views.push(f);
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

export default app;
