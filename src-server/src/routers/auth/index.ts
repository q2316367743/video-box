import { Elysia, t } from "elysia";
import { db } from "@/global/db.js";
import { Result } from "@/views/Result.js";
import { useSnowflake } from "@/utils/Snowflake";

const app = new Elysia({ prefix: "/api/auth" });

// 登录
app.post(
  "login",
  // @ts-ignore
  async ({ jwt, body }) => {
    const { USERNAME = "admin", PASSWORD = "123456" } = process.env;
    console.log(USERNAME, PASSWORD, body);
    if (body.username !== USERNAME || body.password !== PASSWORD) {
      return Result.success({
        success: false,
        message: "用户名或密码错误",
      });
    }
    return Result.success({
      success: true,
      message: "登录成功",
      token: jwt.sign({ id: useSnowflake().nextId() }),
    });
  },
  {
    body: t.Object({
      username: t.String(),
      password: t.String(),
    }),
    detail: {
      tags: ["auth"],
      summary: "登录",
      description: "登录",
    },
  }
);

export default app;
