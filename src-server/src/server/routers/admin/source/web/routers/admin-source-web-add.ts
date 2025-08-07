import {Elysia, t} from "elysia";
import {Result} from "@/views/Result";
import {sourceWebDao} from "@/dao";
// 子路由

const app = new Elysia();

// 新增
app.post(
  "add",
  async ({body}) => {
    const {title, type, props, favicon, folder, order} = body;
    try {
      await sourceWebDao.insert({
        title,
        type,
        props: JSON.stringify(props),
        favicon,
        folder,
        order,
      });

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
    detail: {
      tags: ["source/web"],
      summary: "新增一个网络资源",
      description: "新增一个网络资源",
    },
  }
);

export default app;
