import {Elysia} from "elysia";
// 子路由
import sourceWeb from './source/web';
import sourceDisk from './source/disk';
import taskRouter from './task/TaskRouter';

const app = new Elysia({prefix: "/admin"});

app.use(sourceWeb).use(sourceDisk).use(taskRouter);

export default app;
