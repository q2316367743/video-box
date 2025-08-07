import {Result} from "@/views/Result";
import {Elysia, t} from "elysia";
import {myVideoItemDao} from "@/dao";

const app = new Elysia();

app.put(
  "toggle",
  async ({body}) => {
    const {type, from, payload, cover, title, description} = body;
    // 如果存在记录则删除，不存在则新增
    const one = await myVideoItemDao.query()
      .eq('type', type)
      .eq('from', from)
      .eq('payload', payload)
      .one();
    if (one) {
      await myVideoItemDao.deleteById(one.id);
    } else {
      await myVideoItemDao.insert({type, from, payload, cover, title, description});
    }
    return Result.success();
  },
  {
    body: t.Object({
      type: t.Number(),
      from: t.Number(),
      payload: t.String(),
      cover: t.String(),
      title: t.String(),
      description: t.String(),
    }),
    detail: {
      tags: ["my/video-item"],
      summary: "切换我的视频",
      description: "切换我的视频",
    },
  }
);

export default app;
