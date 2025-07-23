import { Elysia } from "elysia";
import proxyHttp from "./proxy-http";
import proxyUrl from "./proxy-url";

const app = new Elysia({ prefix: "/api/proxy" });

app.use(proxyHttp).use(proxyUrl);

export default app;
