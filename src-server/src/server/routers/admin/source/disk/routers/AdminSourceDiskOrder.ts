import {Elysia, t} from "elysia";
import {sourceDiskDao} from "@/dao";
import {Result} from "@/views/Result";

export default new Elysia()
  .put('/order', async ({body}) => {
    const now = Date.now();
    for (let item of body) {
      await sourceDiskDao.updateById(item.id, {
        order: item.order,
        update_time: now,
      })
    }
    return Result.success();
  }, {
    body: t.Array(t.Object({
      id: t.String(),
      order: t.Number(),
    }))
  })