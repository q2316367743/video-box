import { Elysia, t } from "elysia";
import { db } from "@/global/db.js";
import { Result } from "@/views/Result.js";
import { useSnowflake } from "@/utils/Snowflake";
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
      id: useSnowflake().nextId(),
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
    await updateById<Folder>('folder_web', id, {
      name: name,
      update_time: Date.now()
    })

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
    const folder = await selectById("folder_web", id);
    if (!folder) {
      return Result.error("文件夹不存在");
    }
    // 再排序
    await updateById<Folder>('folder_web', id, {
      order,
      update_time: Date.now()
    })
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
    const folder = await selectById("folder_web", id);
    if (!folder) {
      return Result.error("文件夹不存在");
    }
    // 再删除
    await deleteById('folder_web', id);
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
