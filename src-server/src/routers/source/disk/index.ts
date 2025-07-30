import {Elysia} from "elysia";
import {sourceDiskDao} from "@/dao";
import {Result} from "@/views/Result";

export default new Elysia({prefix: '/api/source/disk'})
  .get("/list", async () => {
    const list = await sourceDiskDao.query().select('title', 'driver', 'id').list();
    return Result.success(list);
  })