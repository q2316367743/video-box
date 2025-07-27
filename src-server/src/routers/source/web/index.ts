import {Elysia} from "elysia";
// 子路由
import sourceWebInfo from "./source-web-info";
import sourceWebMove from "./source-web-move";
import sourceWebList from "./source-web-list";
import sourceWebSort from "./source-web-sort";
import sourceWebRefresh from "./source-web-refresh";

const app = new Elysia({prefix: "/api/source/web"});

app
  .use(sourceWebInfo)
  .use(sourceWebMove)
  .use(sourceWebList)
  .use(sourceWebSort)
  .use(sourceWebRefresh);

export default app;
