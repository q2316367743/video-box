import { Elysia, t } from "elysia";
import axios from "axios";
import { debug } from "@rasla/logify";

const app = new Elysia();

app.get(
  "url/:url",
  async ({ params, set }) => {
    const { url } = params;
    try {
      const response = await axios.get(url, { responseType: "stream" });
      set.headers = response.headers as any;
      return response.data;
    } catch (error) {
      set.status = 500;
    }
  },
  {
    params: t.Object({
      url: t.String(),
    }),
    detail: {
      tags: ["proxy"],
      summary: "http请求",
      description: "代理url的请求，解决前端跨域问题",
    },
  }
);

export default app;
