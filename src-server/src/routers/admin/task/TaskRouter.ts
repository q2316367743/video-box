import {Elysia, t} from 'elysia';
import {runner} from "@/modules/task/TaskRunner";
import {Result} from "@/views/Result";
import {taskDefinitionDao, taskExecutionDao} from "@/dao";
import {running} from "@/modules/task/registry";

export default new Elysia({prefix: '/task'})
  .post('/preset/:definitionId/run',
    async ({params}) => {
      // 前端手动触发预设任务
      await runner.start(params.definitionId, 'manual', params.definitionId)
      return Result.success();
    },
    {
      params: t.Object({
        definitionId: t.String(),
      })
    }
  )
  .delete('/stop/:identifier', ({params}) => {
    runner.cancel(params.identifier);
    return Result.success();
  })
  .get('/definitions',
    async ({query}) => {
      const list = await taskDefinitionDao.query().page(query.pageNum, query.pageSize)
      return Result.success(list);
    },
    {
      query: t.Object({
        pageNum: t.Number({
          default: 1
        }),
        pageSize: t.Number({
          default: 20
        }),
      })
    })
  .get('/executions/:id',
    async ({params, query}) => {
      const list = await taskExecutionDao.query()
        .eq('definition_id', params.id)
        .orderByDesc('created_at')
        .page(query.pageNum, query.pageSize);
      return Result.success(list);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      query: t.Object({
        pageNum: t.Number({
          default: 1
        }),
        pageSize: t.Number({
          default: 20
        }),
      })
    })
  .get('/running', async ({set, request}) => {
    set.headers['Content-Type'] = 'text/event-stream';
    set.headers['Cache-Control'] = 'no-cache';
    set.headers['Connection'] = 'keep-alive';

    // 返回一个 ReadableStream，Elysia 会自动识别并持续发送
    return new ReadableStream({
      start(controller) {
        // 首次把当前任务列表推过去
        controller.enqueue(`event: taskList\ndata: ${JSON.stringify(Array.from(running.values()))}\n\n`);

        // 每 3 秒一次“任务状态变化”并推送
        const timer = setInterval(() => {
          controller.enqueue(`event: taskList\ndata: ${JSON.stringify(Array.from(running.values()))}\n\n`);
        }, 500);

        // 客户端断开时清理
        request.signal.addEventListener('abort', () => {
          clearInterval(timer);
          controller.close();
        });
      }
    })

  });