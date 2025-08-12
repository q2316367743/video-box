import {Elysia, t} from "elysia";
import {sourceSubscribeDao} from "@/dao";
import {SourceSubscribe, SourceSubscribeDisplay} from "@/types/SourceSubscribe";
import {Result} from "@/views/Result";

export default new Elysia()
  .get("list/:display", async ({params}) => {
    const {display} = params;
    let rows: Array<SourceSubscribe>;
    if (display === 'all') {
      // 查询全部
      rows = await sourceSubscribeDao.selectList();
    } else {
      rows = await sourceSubscribeDao.selectList({display: Number(display) as SourceSubscribeDisplay});
    }
    return Result.success(rows.sort((a, b) => a.order - b.order));
  }, {
    params: t.Object({
      display: t.String()
    })
  })