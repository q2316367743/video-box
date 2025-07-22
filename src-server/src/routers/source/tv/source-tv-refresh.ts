import { Elysia, t } from "elysia";
import { list } from "radash";
import { db } from "@/global/db";
import { getM3u8Channel } from "@/utils/file/M3u8Util";
import { Result } from "@/views/Result";

const app = new Elysia();

app.put(
  "refresh/:id",
  async ({ params }) => {
    const { id } = params;
    const { rows } = await db.sql`select * from source_tv where id = ${id}`;
    if (!rows) return Result.error("直播源不存在");
    const row = rows[0];
    if (!row) return Result.error("直播源不存在");
    // 获取新的m3u8数据
    const items = await getM3u8Channel(row.url as any);
    await db.exec("BEGIN");
    try {
      // 删除旧的直播渠道
      await db.sql`delete from source_tv_channel where source_tv_id = ${id}`;
      // 新增新的直播渠道
      await db
        .prepare(
          "insert into source_tv_channel (id, source_tv_id, name, url, group, logo, create_time) values (" +
            list(0, items.length * 7 - 1, "?").join(",") +
            ")"
        )
        .run(
          ...items.flatMap((item) => [
            item.id,
            id,
            item.name,
            item.url,
            item.group,
            item.logo,
            item.create_time,
          ])
        );
      // 修改直播源的更新时间
      await db.sql`update source_tv set update_time = ${Date.now()}, \`length\` = ${
        items.length
      }, refresh_time = ${Date.now()}, refresh_status = 1 where id = ${id}`;
      // 提交事务
      await db.exec("COMMIT");
      return Result.success();
    } catch (e) {
      await db.exec("ROLLBACK");
      return Result.error("刷新失败，" + (e instanceof Error ? e.message : e));
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
  }
);

export default app;
