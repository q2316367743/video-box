import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";
import {folderWebDao, sourceWebDao} from "@/dao";

const app = new Elysia();

app.put(
  "sort",
  async ({ body }) => {
    // 获取全部的源
    for (const element of body) {
      if (element.folder) {
        // 更新文件夹
        await folderWebDao.updateById(element.id, {
          order: element.order
        })
      } else {
        // 更新源
        await sourceWebDao.updateById(element.id, {
          order: element.order
        })
      }
    }
    return Result.success();
  },
  {
    body: t.Array(
      t.Object({
        id: t.String(),
        folder: t.Boolean(),
        order: t.Number(),
      })
    ),
    detail: {
      tags: ["source/web"],
      summary: "更新网络资源排序",
      description: "更新网络资源排序",
    },
  }
);

export default app;
