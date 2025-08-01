import {Elysia} from "elysia";
import proxyHttp from "./proxy-http";
import proxyUrl from "./proxy-url";
import proxyDisk from './ProxyDiskP';

const app = new Elysia({prefix: "/api/proxy"});

app.use(proxyHttp).use(proxyUrl).use(proxyDisk);

export default app;
