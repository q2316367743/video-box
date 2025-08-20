import {Elysia} from "elysia";
import sourceNewsListRouter from "@/server/routers/admin/source/news/routers/SourceNewsListRouter";
import sourceNewsAddRouter from "@/server/routers/admin/source/news/routers/SourceNewsAddRouter";
import sourceNewsUpdateRouter from "@/server/routers/admin/source/news/routers/SourceNewsUpdateRouter";
import sourceNewsDeleteRouter from "@/server/routers/admin/source/news/routers/SourceNewsDeleteRouter";
import sourceNewsEnableRouter from "@/server/routers/admin/source/news/routers/SourceNewsEnableRouter";
import sourceNewsInfoRouter from "@/server/routers/admin/source/news/routers/SourceNewsInfoRouter";
import sourceNewsTestRouter from "@/server/routers/admin/source/news/routers/SourceNewsTestRouter";

export default new Elysia({prefix: '/source/news'})
  .use(sourceNewsListRouter)
  .use(sourceNewsAddRouter)
  .use(sourceNewsUpdateRouter)
  .use(sourceNewsDeleteRouter)
  .use(sourceNewsEnableRouter)
  .use(sourceNewsInfoRouter)
  .use(sourceNewsTestRouter)