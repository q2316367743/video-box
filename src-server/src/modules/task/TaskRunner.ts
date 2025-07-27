// src/taskRunner.ts
import {debug, error} from '@rasla/logify';
import {taskStore, type Task} from "./TaskStore";
import {Result} from "@/views/Result";

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
  runner: (task: Task) => Promise<void>,
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
      taskStore.delete(task.id);
    } catch (e: any) {
      task.status = "failed";
      task.error = e.message ?? String(e);
      task.updatedAt = Date.now();
      error(`任务「${name}」执行失败`)
    }
  })();

  return task;
}


/**
 * 启动任务并阻塞
 * @param name 任务名称
 * @param id 任务ID
 * @param runner 任务执行函数
 * @returns 任务对象
 */
export async function runAsyncTask(
  name: string,
  id: string,
  runner: (task: Task) => Promise<void>,
) {
  const old = taskStore.get(id);
  if (old) {
    debug("存在历史任务，等待历史任务完成")
    while (taskStore.has(id)) {
      await Bun.sleep(100);
    }
    debug("返回历史任务")
    return old;
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
  try {
    await doRealWork(task, runner);
    task.status = "success";
    debug(`任务「${name}」执行成功`)
  } catch (e: any) {
    task.status = "failed";
    task.error = e.message ?? String(e);
    task.updatedAt = Date.now();
    error(`任务「${name}」执行失败`)
  } finally {
    taskStore.delete(task.id);
  }

  return task;
}
