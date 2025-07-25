import { Elysia, t } from "elysia";
import { db } from "@/global/db.js";
import { Result } from "@/views/Result.js";
import { deleteById, insert, selectById, updateById } from "@/utils/SqlUtil";
import { Folder } from "@/types/Folder";

const app = new Elysia({ prefix: "/api/folder/web" });

// 查询全部文件夹
app.get(
  "list",
  async () => {
    const { rows } = await db.sql`select * from folder_web order by \`order\``;
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
    insert("folder_web", {
      name,
    });
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
    const folder = await selectById("folder_web", id);
    if (!folder) {
      return Result.error("文件夹不存在");
    }
    // 再重命名
    await updateById<Folder>("folder_web", id, {
      name: name,
      update_time: Date.now(),
    });

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
    for (const item of body) {
      await updateById<Folder>("folder_web", item.id, {
        order: item.order,
        update_time: Date.now(),
      });
    }
    // 再排序
    return Result.success();
  },
  {
    body: t.Array(
      t.Object({
        id: t.String(),
        order: t.Number(),
      })
    ),
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
    try {
      await db.exec("BEGIN");
      // 先查询
      const folder = await selectById("folder_web", id);
      if (!folder) {
        return Result.error("文件夹不存在");
      }
      // 再删除
      await deleteById("folder_web", id);
      // 批量更新源
      await db.sql`update source_web set folder = '' where folder = ${id}`;
      // 提交事务
      await db.exec("COMMIT");
      return Result.success();
    } catch (e) {
      console.error("删除文件夹失败", e);
      await db.exec("ROLLBACK");
      return Result.error(
        "删除文件夹失败," + (e instanceof Error ? e.message : e)
      );
    }
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
