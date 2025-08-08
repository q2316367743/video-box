import {Elysia} from "elysia";
import {sourceDiskDao} from "@/dao";
import {Result} from "@/views/Result";

export default new Elysia().get('/list', async () => {
  const list = await sourceDiskDao.query().orderByAsc('order').list();
  return Result.success(list.map(item => ({
    ...item,
    data: JSON.parse(item.data)
  })));
})