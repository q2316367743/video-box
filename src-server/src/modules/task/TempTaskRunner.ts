// 临时任务运行期
import {debug, error} from '@rasla/logify';
// 任务状态，pending-等待中，running-运行中，failed-失败
export type TaskStatus = "pending" | "running" | "success" | "failed";
// 任务日志等级，log-普通日志，warning-警告，error-错误
type TaskLogLevel = "log" | "warning" | "error";

export interface TaskLog {
  text: string;
  level: TaskLogLevel;
}

interface TempTask {
  // 任务ID，唯一
  id: string;
  name: string; // 任务名称
  status: TaskStatus;
  progress?: number; // 0~100，可选
  result?: any; // 成功后的返回值
  error?: string; // 失败原因
  // 任务日志
  logs: Array<TaskLog>;
  createdAt: number;
  updatedAt: number;
}

// 用 Map 存，重启进程就消失
export const tempTaskStore = new Map<string, TempTask>();

// 根据任务名执行不同逻辑
async function doRealWork(task: TempTask, runner: (task: TempTask) => Promise<void>) {
  task.status = "running";
  task.progress = 0;
  task.updatedAt = Date.now();
  await runner(task);
}

/**
 * 启动任务并阻塞
 * @param name 任务名称
 * @param id 任务ID
 * @param runner 任务执行函数
 * @returns 任务对象
 */
export async function runAsyncTempTask(
  name: string,
  id: string,
  runner: (task: TempTask) => Promise<void>,
) {
  const old = tempTaskStore.get(id);
  if (old) {
    debug("存在历史任务，等待历史任务完成")
    while (tempTaskStore.has(id)) {
      await Bun.sleep(100);
    }
    debug("返回历史任务")
    return old;
  }
  const task: TempTask = {
    id,
    name,
    status: "pending",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    logs: [],
  };
  tempTaskStore.set(id, task);

  // 异步执行，不阻塞
  try {
    await doRealWork(task, runner);
    task.status = "success";
    debug(`任务「${name}」执行成功`)
  } catch (e: any) {
    task.status = "failed";
    task.error = e.message ?? String(e);
    task.updatedAt = Date.now();
    error(`任务「${name}」执行失败`)
    // console.error(e);
  } finally {
    tempTaskStore.delete(task.id);
  }

  return task;
}
