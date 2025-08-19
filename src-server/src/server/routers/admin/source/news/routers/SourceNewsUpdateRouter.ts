import {Elysia, t} from "elysia";
import {sourceNewsContentDao, sourceNewsDao} from "@/dao";
import {SourceNewsType} from "@/types/SourceNews";
import {refreshSourceNewsOne} from "@/modules/task/preset/refreshSourceNews";
import {Result} from "@/views/Result";
import {beginTransactional} from "@/utils/SqlUtil";

export default new Elysia()
  .put('update/:id', async ({body, params}) => {
    const old = await sourceNewsDao.selectById(params.id);
    if (!old) return Result.notFound();
    await beginTransactional(async () => {
      const now = Date.now();
      await sourceNewsDao.updateById(params.id, {
        updated_at: now,
        logo: body.logo,
        title: body.title,
        tag: body.tag,
        primary_color: body.primary_color,
        website: body.website,
        order: body.order,
        is_enabled: body.is_enabled ? 1 : 0,
        type: body.type as SourceNewsType
      });
      // 更新脚本
      await sourceNewsContentDao.query().eq('news_id', params.id).delete();
      await sourceNewsContentDao.insert({
        news_id: params.id,
        script: body.script
      })
    });
    // 更新后刷新
    const newNews = await sourceNewsDao.selectById(params.id);
    refreshSourceNewsOne(newNews!).catch(() => console.error("刷新失败"));
    return Result.success();
  }, {
    params: t.Object({
      id: t.String(),
    }),
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