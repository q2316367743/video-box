import {Elysia, t} from "elysia";
import {SourceNewsRecordView} from "@/types/SourceNews";
import {getNewsRecords} from "@/modules/task/preset/refreshSourceNews";
import {Result} from "@/views/Result";

export default new Elysia()
  .post('test', async ({body}) => {
    const records: Array<SourceNewsRecordView> = await getNewsRecords(body.script);
    return Result.success(records);
  }, {
    body: t.Object({
      script: t.String()
    })
  })