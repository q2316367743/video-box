import {Elysia, t} from "elysia";
import {SourceNewsRecordView} from "@/types/SourceNews";
import {Result} from "@/views/Result";
import {getNewsRecords} from "@/global/ScriptManage";

export default new Elysia()
  .post('test', async ({body}) => {
    const records: Array<SourceNewsRecordView> = await getNewsRecords(body.script);
    return Result.success(records);
  }, {
    body: t.Object({
      script: t.String()
    })
  })