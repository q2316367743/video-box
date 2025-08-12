import {Elysia} from "elysia";
import {sourceSubscribeRecordDao} from "@/dao";
import {Result} from "@/views/Result";

export default new Elysia()
  .get('read/:id', async ({params}) => {
    const {id} = params;
    const record = await sourceSubscribeRecordDao.selectById(id);
    if (record) {
      await sourceSubscribeRecordDao.updateById(id, {
        read_status: 1
      });
    }
    return Result.success();
  })