import {Result} from "@/views/Result";
import {Elysia, t} from "elysia";
import {sourceTvChannelDao, sourceTvDao} from "@/dao";

const app = new Elysia();

app.get(
  "info/:id",
  async ({params}) => {
    const row = sourceTvDao.selectById(params.id);
    // 查询全部的渠道
    const channels = sourceTvChannelDao.query().eq('source_tv_id', params.id).list();
    return Result.success({
      ...row,
      channels: channels,
    });
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ["source/tv"],
      summary: "获取电视资源",
      description: "获取电视资源",
    },
  }
);

export default app;
