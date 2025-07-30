import {Elysia} from "elysia";
import {sourceDiskDao} from "@/dao";
import {Result} from "@/views/Result";

export default new Elysia().get('/list', async () => {
  return Result.success(await sourceDiskDao.list());
})