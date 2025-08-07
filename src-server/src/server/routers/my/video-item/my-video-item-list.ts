import {Result} from "@/views/Result";
import {Elysia, t} from "elysia";
import {myVideoItemDao} from "@/dao";

const app = new Elysia();

app.get("/list", async ({query}) => {
  const {pageNum, pageSize, type} = query;
  const page = await myVideoItemDao.query().eq('type', type)
    .orderByDesc('create_time')
    .page(pageNum, pageSize);
  return Result.success(page);
}, {
  query: t.Object({
    pageNum: t.Numeric(),
    pageSize: t.Numeric(),
    type: t.String(),
  }),
  detail: {
    tags: ["my/video-item"],
    summary: "获取我的视频列表",
    description: "获取我的视频列表",
  },
});

export default app;
