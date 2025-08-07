import {Elysia, t} from "elysia";
import {settingDao} from "@/dao";
import {Result} from "@/views/Result";

const app = new Elysia()

app.post('/save', async ({body}) => {
   await settingDao.save(body);
   return Result.success();
}, {
  body: t.Record(t.String(), t.Any()),
})

export default app;