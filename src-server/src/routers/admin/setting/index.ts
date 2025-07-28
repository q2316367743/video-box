import {Elysia} from "elysia";
import adminSettingAll from "@/routers/admin/setting/routers/admin-setting-all";
import adminSettingSave from "@/routers/admin/setting/routers/admin-setting-save";

const app = new Elysia({prefix: '/api/admin/setting'})

app.use(adminSettingAll)
  .use(adminSettingSave)

export default app;