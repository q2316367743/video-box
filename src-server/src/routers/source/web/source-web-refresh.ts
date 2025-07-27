import {runAsyncTask, runTask} from "@/modules/task/TaskRunner";
import {taskStore} from "@/modules/task/TaskStore";
import {refreshSourceWeb} from "@/modules/web/func/RefreshSourceWeb";
import {Result} from "@/views/Result";
import {Elysia, t} from "elysia";
import {sourceWebDao} from "@/dao";
import {debug} from "@rasla/logify";

const app = new Elysia();

app.get(
  "refresh/:id",
  async ({params}) => {
    const {id} = params;
    const sourceWeb = await sourceWebDao.selectById(id);
    if (!sourceWeb) return Result.error("网络资源不存在");
    const taskId = `/source/web/delay/${id}`;
    // 判断是否已存在
    const task = await runAsyncTask(
      `刷新「${sourceWeb.title}」`,
      taskId,
      async () => {
        await refreshSourceWeb(sourceWeb);
      }
    );
    if (task.status === 'failed') {
      return Result.error(task.error || '系统异常');
    }
    return Result.success("刷新成功");
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ["source/web"],
      summary: "刷新网络资源",
      description: "刷新网络资源",
    },
  }
);

export default app;
