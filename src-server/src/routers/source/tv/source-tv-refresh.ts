import {Elysia, t} from "elysia";
import {debug} from "@rasla/logify";
import {db} from "@/global/db";
import {getM3u8Channel} from "@/utils/file/M3u8Util";
import {Result} from "@/views/Result";
import {runAsyncTask} from "@/modules/task/TempTaskRunner";
import {sourceTvChannelDao, sourceTvDao} from "@/dao";
import {SourceTv} from "@/types/SourceTv";

const app = new Elysia();

async function runSourceTvRefresh(row: SourceTv) {
  const {id, url} = row;
  // 获取新的m3u8数据
  debug("获取新的m3u8数据");
  const items = await getM3u8Channel(url);
  debug(`获取到${items.length}个直播渠道，开启事务`);
  await db.exec("BEGIN");
  try {
    // 删除旧的直播渠道
    debug("删除旧的直播渠道");
    await sourceTvChannelDao.deleteFromTvId(id);
    // 新增新的直播渠道
    debug("新增新的直播渠道");
    for (const item of items) {
      await sourceTvChannelDao.insert({
        source_tv_id: id,
        name: item.name,
        url: item.url,
        group: item.group,
        logo: item.logo
      })
      debug(`新增直播渠道「${item.name}」`);
    }
    // 修改直播源的更新时间
    debug("修改直播源的更新时间");
    await sourceTvDao.updateById(id, {
      update_time: Date.now(),
      length: items.length,
      refresh_time: Date.now(),
      refresh_status: 1,
    })
    // 提交事务
    debug("提交事务");
    await db.exec("COMMIT");
  } catch (e) {
    debug("回滚事务");
    console.error(e);
    await db.exec("ROLLBACK");
  }
}

app.put(
  "refresh/:id",
  async ({params}) => {
    const {id} = params;
    const row = await sourceTvDao.selectById(id);
    if (!row) return Result.error("直播源不存在");
    const taskId = `/source/web/channel/${id}`;
    // 判断是否已存在
    // 加入任务
    const task = await runAsyncTask(`刷新「${row.name}」直播源`, `/source/web/channel/${id}`, async () => {
      await runSourceTvRefresh(row);
    });
    if (task.status === 'failed') {
      return Result.error(task.error || '系统异常');
    }
    return Result.success("刷新成功");
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ["source/tv"],
      summary: "刷新电视资源",
      description: "刷新电视资源",
    },
  }
);

export default app;
