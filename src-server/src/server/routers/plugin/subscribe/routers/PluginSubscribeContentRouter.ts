import {Elysia, t} from "elysia";
import {sourceSubscribeContentDao} from "@/dao";
import {Result} from "@/views/Result";

export default new Elysia()
  .get('content/:id', async ({params}) => {
    const {id} = params;
    const content = await sourceSubscribeContentDao.selectById(id);
    return Result.success(content);
  }, {
    params: t.Object({
      id: t.String()
    })
  })