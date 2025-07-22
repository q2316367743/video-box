import { Elysia, t } from "elysia";
import { db } from "@/global/db.js";
import { Result } from "@/views/Result.js";
import { useSnowflake } from "@/utils/Snowflake";

const app = new Elysia({ prefix: "/api/folder/web" });

// 查询全部文件夹
app.get(
  "list",
  async () => {
    const { rows } = await db.sql`select * from folder_web`;
    return Result.success(rows || []);
  },
  {
    detail: {
      tags: ["folder/web"],
      summary: "查询全部文件夹",
      description: "查询全部文件夹",
    },
  }
);

// 创建一个文件夹
app.post(
  "post",
  async ({ body }) => {
    const { name } = body;
    await db.sql`insert into folder_web (id, name) values (${useSnowflake().nextId()}, ${name})`;
    return Result.success();
  },
  {
    body: t.Object({
      name: t.String(),
    }),
    detail: {
      tags: ["folder/web"],
      summary: "创建一个文件夹",
      description: "创建一个文件夹",
    },
  }
);

// 重命名
app.put(
  "rename",
  async ({ body }) => {
    const { id, name } = body;
    // 先查询
    const { rows } = await db.sql`select * from folder_web where id = ${id}`;
    if (!rows || rows.length === 0) {
      return Result.error("文件夹不存在");
    }
    // 再重命名
    await db.sql`update folder_web set name = ${name}, update_time = ${Date.now()} where id = ${id}`;
    return Result.success();
  },
  {
    body: t.Object({
      id: t.String(),
      name: t.String(),
    }),
    detail: {
      tags: ["folder/web"],
      summary: "重命名文件夹",
      description: "重命名文件夹",
    },
  }
);

// 重排序
app.put(
  "order",
  async ({ body }) => {
    const { id, order } = body;
    // 先查询
    const { rows } = await db.sql`select * from folder_web where id = ${id}`;
    if (!rows || rows.length === 0) {
      return Result.error("文件夹不存在");
    }
    // 再重命名
    await db.sql`update folder_web set order = ${order}, update_time = ${Date.now()} where id = ${id}`;
    return Result.success();
  },
  {
    body: t.Object({
      id: t.String(),
      order: t.Number(),
    }),
    detail: {
      tags: ["folder/web"],
      summary: "重排序文件夹",
      description: "重排序文件夹",
    },
  }
);

// 删除
app.delete(
  "delete",
  async ({ body }) => {
    const { id } = body;
    // 先查询
    const { rows } = await db.sql`select * from folder_web where id = ${id}`;
    if (!rows || rows.length === 0) {
      return Result.error("文件夹不存在");
    }
    // 再删除
    await db.sql`delete from folder_web where id = ${id}`;
    return Result.success();
  },
  {
    body: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ["folder/web"],
      summary: "删除文件夹",
      description: "删除文件夹",
    },
  }
);

export default app;
