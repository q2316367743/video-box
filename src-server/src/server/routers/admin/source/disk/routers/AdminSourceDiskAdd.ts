import {Elysia, t} from "elysia";
import {sourceDiskDao} from "@/dao";
import {Result} from "@/views/Result";

export default new Elysia()
  .post("/add", async ({body}) => {
    await sourceDiskDao.save({
      ...body,
      data: JSON.stringify(body.data)
    });
    return Result.success();
  }, {
    body: t.Object({
      title: t.String(),
      driver: t.String(),
      data: t.Record(t.String(), t.Any())
    })
  })