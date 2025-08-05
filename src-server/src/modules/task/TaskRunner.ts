import {running, abortCtl} from './registry';
import {TaskExecution, TaskStatus, TaskTrigger} from "@/types/Task";
import {taskDefinitionDao, taskExecutionDao} from "@/dao";

export class TaskRunner {
  /**
   * 启动一次执行
   * @param identifier   全局唯一
   * @param trigger      触发来源
   * @param definitionId 预设任务必填；临时任务可空
   * @param adhocFn      临时任务必填：运行函数
   */
  async start(
    identifier: string,
    trigger: TaskTrigger,
    definitionId?: string,
    adhocFn?: (ctx: { signal: AbortSignal; update: (p: number) => void }) => Promise<any>
  ): Promise<TaskExecution> {
    if (running.has(identifier)) throw new Error(`${identifier} already running`);

    const exec = await taskExecutionDao.insert({
      definition_id: definitionId,
      identifier,
      trigger,
      status: 'running'
    })

    running.set(identifier, exec);

    const controller = new AbortController();
    abortCtl.set(identifier, controller);

    // 异步跑
    this._run(exec, controller.signal, adhocFn).catch(() => {
    });
    return exec;
  }

  private async _run(
    exec: TaskExecution,
    signal: AbortSignal,
    adhocFn?: (ctx: any) => Promise<any>
  ) {
    try {
      let result: any;
      if (exec.definition_id) {
        // 预设任务：动态 import impl 下文件
        const row = await taskDefinitionDao.selectById(exec.definition_id);
        if (!row) return Promise.reject(new Error(`TaskDefinition ${exec.definition_id} not found`));

        const {default: fn} = await import(`./impl/${row.script}`);
        result = await fn({signal, update: (p: number) => this._update(exec.id, p)});
      } else if (adhocFn) {
        // 临时任务
        result = await adhocFn({signal, update: (p: number) => this._update(exec.id, p)});
      } else {
        return Promise.reject(new Error('Neither script nor adhocFn provided'))
      }

      this._finish(exec.id, 'done', result);
    } catch (err: any) {
      const status = signal.aborted ? 'cancelled' : 'failed';
      this._finish(exec.id, status, undefined, signal.aborted ? '用户终止' : err.message);
    } finally {
      running.delete(exec.identifier);
      abortCtl.delete(exec.identifier);
    }
  }

  private _update(execId: string, p: number) {
    taskExecutionDao.updateById(execId, {progress: p})
  }

  private _finish(execId: string, status: TaskStatus, result?: any, error?: string) {
    taskExecutionDao.updateById(execId, {status, finished_at: Date.now(), result, error})
  }

  cancel(identifier: string): boolean {
    const ctl = abortCtl.get(identifier);
    if (!ctl) return false;
    ctl.abort();
    return true;
  }
}

export const runner = new TaskRunner();