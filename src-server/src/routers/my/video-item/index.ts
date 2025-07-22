import { Elysia } from "elysia";
import myVideoItemDel from "./my-video-item-del";
import myVideoItemPost from "./my-video-item-post";
import myVideoItemExist from "./my-video-item-exist";
import myVideoItemToggle from "./my-video-item-toggle";
import myVideoItemList from "./my-video-item-list";

const app = new Elysia({ prefix: "/api/my/video-item" });

app
  .use(myVideoItemDel)
  .use(myVideoItemExist)
  .use(myVideoItemList)
  .use(myVideoItemPost)
  .use(myVideoItemToggle);

export default app;
