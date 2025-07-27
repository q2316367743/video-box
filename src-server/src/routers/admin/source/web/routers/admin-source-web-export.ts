import {Result} from "@/views/Result";
import {Elysia} from "elysia";
import {sourceWebDao} from "@/dao";

const app = new Elysia();

app.post(
  "export",
  async () => {
    // 获取全部的源
    const rows = await sourceWebDao.selectList();
    if (rows) {
      const data = rows.map((row) => ({
        ...row,
        props: JSON.parse(row.props as string),
      }));
      return Result.success(data);
    }
    return Result.success();
  },
  {
    detail: {
      tags: ["source/web"],
      summary: "导出全部网络资源",
      description: "将全部网络资源返回，前端自己触发下载",
    },
  }
);

export default app;
