import {Elysia, t} from "elysia";
import {subscribeRefreshOne} from "@/modules/task/preset/SubscribeCache";
import {sourceSubscribeDao} from "@/dao";
import {Result} from "@/views/Result";
import {runAsyncTempTask} from "@/modules/task/TempTaskRunner";

export default new Elysia()
  .get('refresh/:id', async ({params}) => {
    const {id} = params;
    const subscribe = await sourceSubscribeDao.selectById(id);
    if (!subscribe) return Result.fail("订阅不存在");
    await runAsyncTempTask(`刷新「${subscribe.name}」订阅源`, `/source/subscribe/record/${id}`, async () => {
      await subscribeRefreshOne(subscribe);
    })
    return Result.success("刷新成功");
  }, {
    params: t.Object({
      id: t.String()
    })
  })