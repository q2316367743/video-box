import { Elysia } from "elysia";
// 子路由
import adminSourceWebAdd from "./routers/admin-source-web-add";
import adminSourceWebDelete from "./routers/admin-source-web-delete";
import adminSourceWebExport from "./routers/admin-source-web-export";
import adminSourceWebImport from "./routers/admin-source-web-import";
import adminSourceWebList from "./routers/admin-source-web-list";
import adminSourceWebUpdate from "./routers/admin-source-web-update";
import adminSourceWebEnable from "./routers/admin-source-web-enable";

const app = new Elysia({ prefix: "source/web" });

app.use(adminSourceWebAdd);
app.use(adminSourceWebDelete);
app.use(adminSourceWebExport);
app.use(adminSourceWebImport);
app.use(adminSourceWebList);
app.use(adminSourceWebUpdate);
app.use(adminSourceWebEnable);

export default app;
