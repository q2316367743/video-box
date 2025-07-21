import { Elysia } from "elysia";
import myVideoItemDel from "./my-video-item-del";
import myVideoItemPost from "./my-video-item-post";
import myVideoItemExist from "./my-video-item-exist";
import myVideoItemToggle from "./my-video-item-toggle";

const app = new Elysia({ prefix: "/api/my/video-item" });

app
  .use(myVideoItemDel)
  .use(myVideoItemPost)
  .use(myVideoItemExist)
  .use(myVideoItemToggle);

export default app;
