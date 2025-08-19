import {Elysia, t} from "elysia";
import {sourceNewsContentDao, sourceNewsDao} from "@/dao";
import {SourceNewsType} from "@/types/SourceNews";
import {refreshSourceNewsOne} from "@/modules/task/preset/refreshSourceNews";
import {Result} from "@/views/Result";
import {beginTransactional} from "@/utils/SqlUtil";

export default new Elysia()
  .post('add', async ({body}) => {
    const now = Date.now();
    const row = await beginTransactional(async () => {
      const row = await sourceNewsDao.insert({
        created_at: now,
        updated_at: now,
        is_enabled: body.is_enabled ? 1 : 0,
        logo: body.logo,
        title: body.title,
        tag: body.tag,
        primary_color: body.primary_color,
        website: body.website,
        order: body.order,
        type: body.type as SourceNewsType
      });
      // 新增详情
      await sourceNewsContentDao.insert({
        news_id: row.id,
        script: body.script
      });
      return row;
    })
    // 新增后刷新
    refreshSourceNewsOne(row).catch(() => console.error("刷新失败"));
    return Result.success();
  }, {
    body: t.Object({
      is_enabled: t.Boolean(),
      logo: t.String(),
      title: t.String(),
      tag: t.String(),
      primary_color: t.String(),
      website: t.String(),
      type: t.Number(),
      order: t.Number(),
      script: t.String()
    })
  })