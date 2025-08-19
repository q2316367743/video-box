import {Elysia} from "elysia";
// 子路由
import sourceWeb from './source/web';
import sourceDisk from './source/disk';
import sourceNewsRouter from './source/news'
import taskRouter from './task/TaskRouter';
import aiRouter from './source/ai';

const app = new Elysia({prefix: "/admin"});

app.use(sourceWeb).use(sourceDisk).use(taskRouter).use(aiRouter).use(sourceNewsRouter);

export default app;
