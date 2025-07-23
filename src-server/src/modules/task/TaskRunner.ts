// src/taskRunner.ts
import { taskStore, type Task } from "./TaskStore";

// 模拟一个耗时 5~10 秒的 CPU 任务
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 根据任务名执行不同逻辑
async function doRealWork(task: Task, runner: (task: Task) => Promise<void>) {
  task.status = "running";
  task.progress = 0;
  task.updatedAt = Date.now();
  await runner(task);
}

/**
 * 启动任务并立刻返回
 * @param name 任务名称
 * @param id 任务ID
 * @param runner 任务执行函数
 * @returns 任务对象
 */
export function runTask(
  name: string,
  id: string,
  runner: (task: Task) => Promise<void>
) {
  if (taskStore.has(id)) {
    throw new Error(`task ${id} already exists`);
  }
  const task: Task = {
    id,
    name,
    status: "pending",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    logs: [],
  };
  taskStore.set(id, task);

  // 异步执行，不阻塞
  (async () => {
    try {
      await doRealWork(task, runner);
      // 运行成功，删除任务
      taskStore.delete(task.id);
    } catch (e: any) {
      task.status = "failed";
      task.error = e.message ?? String(e);
      task.updatedAt = Date.now();
    }
  })();

  return task;
}
