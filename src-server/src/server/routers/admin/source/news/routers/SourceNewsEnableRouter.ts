import {Elysia, t} from "elysia";
import {sourceNewsContentDao, sourceNewsDao} from "@/dao";
import {SourceNewsType} from "@/types/SourceNews";
import {refreshSourceNewsOne} from "@/modules/task/preset/refreshSourceNews";
import {Result} from "@/views/Result";
import {beginTransactional} from "@/utils/SqlUtil";

export default new Elysia()
  .put('enable/:id', async ({body, params}) => {
    const old = await sourceNewsDao.selectById(params.id);
    if (!old) return Result.notFound();
    await sourceNewsDao.updateById(params.id, {
      is_enabled: (old.is_enabled === 0) ? 1 : 0
    })
    return Result.success();
  }, {
    params: t.Object({
      id: t.String(),
    })
  })