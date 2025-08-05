import {Elysia, t} from 'elysia';
import {runner} from "@/modules/task/TaskRunner";
import {Result} from "@/views/Result";
import {taskDefinitionDao, taskExecutionDao} from "@/dao";

export default new Elysia({prefix: '/api/task'})
  .post('/preset/:definitionId/run', async ({params}) => {
      // 前端手动触发预设任务
      await runner.start(params.definitionId, 'manual', params.definitionId)
      return Result.success();
    }, {
      params: t.Object({
        definitionId: t.String(),
      })
    }
  ).delete('/stop/:identifier', ({params}) => {
    runner.cancel(params.identifier);
    return Result.success();
  })
  .get('/definitions', async ({query}) => {
    const list = await taskDefinitionDao.query().page(query.pageNum, query.pageSize)
    return Result.success(list);
  }, {
    query: t.Object({
      pageNum: t.Number({
        default: 1
      }),
      pageSize: t.Number({
        default: 20
      }),
    })
  })
  .get('/executions/:id', async ({params, query}) => {
    const list = await taskExecutionDao.query()
      .eq('definition_id', params.id)
      .orderByDesc('created_at')
      .page(query.pageNum, query.pageSize);
    return Result.success(list);
  }, {
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
  });