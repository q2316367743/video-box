import {Elysia} from "elysia";
import {Result} from "@/views/Result";
import {sourceSubscribeGroupDao} from "@/dao";

/**
 * 查询全部分组
 */
export default new Elysia()
  .get("/group", () => {
    return Result.success(sourceSubscribeGroupDao.selectList());
  })