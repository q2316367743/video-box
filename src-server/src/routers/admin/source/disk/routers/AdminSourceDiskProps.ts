import {Elysia} from "elysia";
import {Result} from "@/views/Result";
import {DiskPluginOptions, DiskPluginProps} from "@/modules/disk";

const app = new Elysia();

app.get('/props', async () => {
  return Result.success({
    options: DiskPluginOptions,
    props: DiskPluginProps
  })
})

export default app;