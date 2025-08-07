import {Elysia} from "elysia";
import adminSettingAll from "@/server/routers/admin/setting/routers/admin-setting-all";
import adminSettingSave from "@/server/routers/admin/setting/routers/admin-setting-save";

const app = new Elysia({prefix: '/admin/setting'})

app.use(adminSettingAll)
  .use(adminSettingSave)

export default app;