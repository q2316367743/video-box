import { Elysia } from "elysia";
// 子路由
import sourceTvList from "./source-tv-list";
import sourceTvAdd from "./source-tv-add";
import sourceTvUpdate from "./source-tv-update";
import sourceTvDel from "./source-tv-del";
import sourceTvInfo from "./source-tv-info";
import sourceTvRefresh from "./source-tv-refresh";

const app = new Elysia({ prefix: "/source/tv" });

app.use(sourceTvList);
app.use(sourceTvAdd);
app.use(sourceTvUpdate);
app.use(sourceTvDel);
app.use(sourceTvInfo);
app.use(sourceTvRefresh);

export default app;
