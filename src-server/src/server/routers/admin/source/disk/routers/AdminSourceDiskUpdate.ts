import {Elysia, t} from "elysia";
import {sourceDiskDao} from "@/dao";
import {Result} from "@/views/Result";

export default new Elysia()
  .put('/update/:id', async ({params, body}) => {
    const {id} = params;
    await sourceDiskDao.update(id, {
      ...body,
      data: JSON.stringify(body.data)
    });
    return Result.success();
  }, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      title: t.String(),
      driver: t.String(),
      data: t.Record(t.String(), t.Any())
    })
  })