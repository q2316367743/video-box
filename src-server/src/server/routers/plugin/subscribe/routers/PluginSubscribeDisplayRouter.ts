import {Elysia} from "elysia";
import {Result} from "@/views/Result";
import {sourceSubscribeDao} from "@/dao";

export default new Elysia()
  .get("display", async () => {
    return Result.success(await sourceSubscribeDao.displayStatistics())
  })