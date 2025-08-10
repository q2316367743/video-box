import {Elysia, t} from "elysia";
import {sourceSubscribeDao, sourceSubscribeGroupDao} from "@/dao";
import {SourceSubscribe, SourceSubscribeDisplay, SourceSubscribeGroup} from "@/types/SourceSubscribe";
import {group} from "@/utils/ArrayUtil";
import {Result} from "@/views/Result";

export default new Elysia()
  .get("list/:display", async ({params}) => {
    const {display} = params;
    let rows: Array<SourceSubscribe>;
    let groups: Array<SourceSubscribeGroup>;
    if (display === 'all') {
      // 查询全部
      rows = await sourceSubscribeDao.selectList();
      groups = await sourceSubscribeGroupDao.selectList();
    } else {
      rows = await sourceSubscribeDao.selectList({display: Number(display) as SourceSubscribeDisplay});
      const groupIds = rows.map(e => e.group_id);
      groups = await sourceSubscribeGroupDao.query().in('id', groupIds).list();
    }
    const rowMap = group(rows, 'group_id');
    return Result.success(groups.map(e => ({
      ...e,
      items: rowMap.getOrDefault(e.id, [])
    })).sort((a, b) => a.order - b.order));
  }, {
    params: t.Object({
      display: t.String()
    })
  })