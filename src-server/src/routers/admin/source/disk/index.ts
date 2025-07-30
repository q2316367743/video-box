import {Elysia} from "elysia";

import adminSourceDiskProps from "@/routers/admin/source/disk/routers/AdminSourceDiskProps";

const app = new Elysia({prefix: '/source/disk'})

app.use(adminSourceDiskProps);

export default app;