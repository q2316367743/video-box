import { Elysia } from "elysia";

import pluginWebDetail from "./plugin-web-detail";
import pluginWebList from "./plugin-web-list";
import pluginWebSearch from "./plugin-web-search";
import pluginWebHome from "./plugin-web-home";

const app = new Elysia({ prefix: "/plugin/web" });

app
  .use(pluginWebDetail)
  .use(pluginWebList)
  .use(pluginWebSearch)
  .use(pluginWebHome);

export default app;
