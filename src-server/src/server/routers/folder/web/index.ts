import {Elysia, t} from "elysia";
import {db} from "@/global/db";
import {Result} from "@/views/Result";
import {folderWebDao, sourceWebDao} from "@/dao";

const app = new Elysia({prefix: "/folder/web"});

// 查询全部文件夹
app.get(
  "list",
  async () => {
    const rows = await folderWebDao.query().orderByAsc("order").list();
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
  async ({body}) => {
    const {name} = body;
    await folderWebDao.insert({name});
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
  async ({body}) => {
    const {id, name} = body;
    // 先查询
    const folder = await folderWebDao.selectById(id);
    if (!folder) {
      return Result.error("文件夹不存在");
    }
    // 再重命名
    await folderWebDao.updateById(id, {
      name: name,
      update_time: Date.now(),
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
  async ({body}) => {
    for (const item of body) {
      await folderWebDao.updateById(item.id, {
        order: item.order,
        update_time: Date.now(),
      })
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
  async ({body}) => {
    const {id} = body;
    try {
      await db.exec("BEGIN");
      // 先查询
      const folder = await folderWebDao.selectById(id);
      if (!folder) {
        return Result.error("文件夹不存在");
      }
      // 再删除
      await folderWebDao.deleteById(id);
      // 批量更新源
      await sourceWebDao.updateById(id, {
        folder: ''
      })
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
