import {Elysia} from "elysia";
import {Result} from "@/views/Result";
import {settingDao} from "@/dao";

const app = new Elysia();

app.get('/all', async () => {
  return Result.success(await settingDao.globalAll());
})

export default app;