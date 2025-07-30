import {Elysia} from "elysia";

import adminSourceDiskProps from "@/routers/admin/source/disk/routers/AdminSourceDiskProps";
import adminSourceDiskList from "@/routers/admin/source/disk/routers/AdminSourceDiskList";
import adminSourceDiskAdd from "@/routers/admin/source/disk/routers/AdminSourceDiskAdd";
import adminSourceDiskUpdate from "@/routers/admin/source/disk/routers/AdminSourceDiskUpdate";
import adminSourceDiskDelete from "@/routers/admin/source/disk/routers/AdminSourceDiskDelete";

const app = new Elysia({prefix: '/source/disk'})

app.use(adminSourceDiskProps)
  .use(adminSourceDiskList)
  .use(adminSourceDiskAdd)
  .use(adminSourceDiskUpdate)
  .use(adminSourceDiskDelete);

export default app;