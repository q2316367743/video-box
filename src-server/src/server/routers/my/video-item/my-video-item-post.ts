import {Result} from "@/views/Result";
import {Elysia, t} from "elysia";
import {myVideoItemDao} from "@/dao";

const app = new Elysia();

app.post(
  "post",
  async ({body}) => {
    const {type, from, payload, cover, title, description} = body;
    // 先查询是否存在
    const one = await myVideoItemDao.query()
      .eq('type', type)
      .eq('from', from)
      .eq('payload', payload)
      .one();
    // 如果存在，则删除
    if (one) {
      await myVideoItemDao.deleteById(one.id)
    }
    // 插入新的插入
    await myVideoItemDao.insert({type, from, payload, cover, title, description})
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
      summary: "添加我的视频",
      description: "添加我的视频",
    },
  }
);

export default app;
