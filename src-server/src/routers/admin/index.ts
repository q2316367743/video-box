import { Elysia, t } from "elysia";
// 子路由
import sourceWeb from './source/web';

const app = new Elysia({ prefix: "/api/admin" });

app.use(sourceWeb);

export default app;
