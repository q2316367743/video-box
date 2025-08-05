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
  .get('/definitions', async () => {
    const list = await taskDefinitionDao.query().list()
    return Result.success(list);
  })
  .get('/executions/:id', async ({params}) => {
    const list = await taskExecutionDao.query()
      .eq('definition_id', params.id)
      .orderByDesc('created_at')
      .list();
    return Result.success(list);
  }, {
    params: t.Object({
      id: t.String(),
    })
  });