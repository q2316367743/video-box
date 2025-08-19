import {Elysia} from "elysia";
import {sourceNewsDao} from "@/dao";
import {Result} from "@/views/Result";

export default new Elysia()
  .get("list", async () => {
    const list = await sourceNewsDao.selectList()
    return Result.success(list);
  })