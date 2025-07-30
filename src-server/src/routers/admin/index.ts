import { Elysia } from "elysia";
// 子路由
import sourceWeb from './source/web';
import sourceDisk from './source/disk';

const app = new Elysia({ prefix: "/api/admin" });

app.use(sourceWeb).use(sourceDisk);

export default app;
