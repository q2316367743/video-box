import {Elysia, t} from "elysia";
import {sourceDiskDao} from "@/dao";
import {Result} from "@/views/Result";

export default new Elysia({prefix: '/api/source/disk'})
  .get("/list", async () => {
    const list = await sourceDiskDao.query().select('title', 'driver', 'id').list();
    return Result.success(list);
  })
  .get("/info/:id", async ({params}) => {
    const {id} = params;
    const one = await sourceDiskDao
      .query()
      .eq("id", id).select('title', 'driver', 'id')
      .one();
    return Result.success(one);
  }, {
    params: t.Object({
      id: t.String(),
    })
  })