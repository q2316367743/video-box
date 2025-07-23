import { taskStore } from "@/modules/task/TaskStore";
import { Result } from "@/views/Result";
import { Elysia, t } from "elysia";

const app = new Elysia();

app.post(
  "task",
  async ({ body }) => {
    return Result.success(
      body
        .filter((id) => taskStore.has(`/tv/${id}`))
        .map((id) => taskStore.get(`/tv/${id}`))
    );
  },
  {
    body: t.Array(t.String()),
  }
);

export default app;
