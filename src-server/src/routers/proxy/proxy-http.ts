import { Elysia, t } from "elysia";
import { Result } from "@/views/Result";
import { http } from "@/global/http";

const app = new Elysia();

app.post(
  "http",
  async ({ body }) => {
    try {
      const rsp = await http.request(body);
      return Result.success(rsp.data);
    } catch (e) {
      return Result.errorWithData("请求失败", e);
    }
  },
  {
    body: t.Record(t.String(), t.Any()),
    detail: {
      tags: ["proxy"],
      summary: "HTTP 代理",
      description: "使用axios发送请求，解决前端跨域问题",
    },
  }
);

export default app;
