import {Elysia, t} from "elysia";
import {Result} from "@/views/Result";
import {sourceWebDao} from "@/dao";

const app = new Elysia();

// 更新
app.put(
  "update/:id",
  async ({params, body}) => {
    const {id} = params;
    const {title, type, props, favicon, folder, order} = body;
    try {
      await sourceWebDao.updateById(id, {
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
    detail: {
      tags: ["source/web"],
      summary: "更新一个网络资源",
      description: "更新一个网络资源",
    },
  }
);

export default app;
