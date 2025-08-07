import {Elysia} from "elysia";

import adminSourceDiskProps from "@/server/routers/admin/source/disk/routers/AdminSourceDiskProps";
import adminSourceDiskList from "@/server/routers/admin/source/disk/routers/AdminSourceDiskList";
import adminSourceDiskAdd from "@/server/routers/admin/source/disk/routers/AdminSourceDiskAdd";
import adminSourceDiskUpdate from "@/server/routers/admin/source/disk/routers/AdminSourceDiskUpdate";
import adminSourceDiskDelete from "@/server/routers/admin/source/disk/routers/AdminSourceDiskDelete";
import adminSourceDiskOrder from "@/server/routers/admin/source/disk/routers/AdminSourceDiskOrder";

const app = new Elysia({prefix: '/source/disk'})

app.use(adminSourceDiskProps)
  .use(adminSourceDiskList)
  .use(adminSourceDiskAdd)
  .use(adminSourceDiskUpdate)
  .use(adminSourceDiskDelete)
  .use(adminSourceDiskOrder);

export default app;