import { Elysia } from "elysia";
import proxyHttp from "./proxy-http";

const app = new Elysia({ prefix: "/api/proxy" });

app.use(proxyHttp);

export default app;
