import { Elysia, t } from "elysia";
import { debug } from "@rasla/logify";
import { list } from "radash";
import { db } from "@/global/db";
import { getM3u8Channel } from "@/utils/file/M3u8Util";
import { Result } from "@/views/Result";
import { runTask } from "@/modules/task/TaskRunner";
import { addTaskLog } from "@/modules/task/TaskStore";

const app = new Elysia();

app.put(
  "refresh/:id",
  async ({ params }) => {
    const { id } = params;
    const { rows } = await db.sql`select * from source_tv where id = ${id}`;
    if (!rows) return Result.error("直播源不存在");
    const row = rows[0];
    if (!row) return Result.error("直播源不存在");
    runTask(`刷新「${row.name}」直播源`, `/tv/${id}`, async (task) => {
      // 获取新的m3u8数据
      addTaskLog(task.id, "获取新的m3u8数据");
      debug("获取新的m3u8数据");
      const items = await getM3u8Channel(row.url as any);
      addTaskLog(task.id, `获取到${items.length}个直播渠道，开启事务`);
      debug(`获取到${items.length}个直播渠道，开启事务`);
      await db.exec("BEGIN");
      try {
        // 删除旧的直播渠道
        addTaskLog(task.id, "删除旧的直播渠道");
        debug("删除旧的直播渠道");
        await db.sql`delete from source_tv_channel where source_tv_id = ${id}`;
        // 新增新的直播渠道
        addTaskLog(task.id, "新增新的直播渠道");
        debug("新增新的直播渠道");
        for (const item of items) {
          await db.sql`insert into source_tv_channel (id, source_tv_id, \`name\`, url, \`group\`, logo, create_time) values (${item.id}, ${id}, ${item.name}, ${item.url}, ${item.group}, ${item.logo}, ${item.create_time})`;
          debug(`新增直播渠道「${item.name}」`);
        }
        // 修改直播源的更新时间
        addTaskLog(task.id, "修改直播源的更新时间");
        debug("修改直播源的更新时间");
        await db.sql`update source_tv set update_time = ${Date.now()}, \`length\` = ${
          items.length
        }, refresh_time = ${Date.now()}, refresh_status = 1 where id = ${id}`;
        // 提交事务
        debug("提交事务");
        addTaskLog(task.id, "提交事务");
        await db.exec("COMMIT");
      } catch (e) {
        debug("回滚事务");
        addTaskLog(task.id, "回滚事务", "error");
        console.error(e);
        await db.exec("ROLLBACK");
      }
    });
    return Result.success("开始刷新");
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
