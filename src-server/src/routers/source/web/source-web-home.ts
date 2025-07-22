import { db } from "@/global/db";
import { Folder } from "@/types/Folder";
import { SourceWeb } from "@/types/SourceWeb";
import { Result } from "@/views/Result";
import { WebItemView } from "@/views/WebItemView";
import { Elysia, t } from "elysia";

const app = new Elysia();

/**
 * 查询首页
 * 0-根目录（文件夹+文件）
 * root-根目录（文件）
 * all-全部（文件）
 * 其他-指定目录（文件）
 */
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
    if (folder === "0" || folder === "root") {
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
    detail: {
      tags: ["source/web"],
      summary: "查询首页网络资源",
      description: "查询首页 0-根目录（文件夹+文件） root-根目录（文件） all-全部（文件） 其他-指定目录（文件）",
    },
  }
);

export default app;
