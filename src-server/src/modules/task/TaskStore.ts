// 任务状态，pending-等待中，running-运行中，failed-失败
export type TaskStatus = "pending" | "running" | "success" | "failed";
// 任务日志等级，log-普通日志，warning-警告，error-错误
type TaskLogLevel = "log" | "warning" | "error";

export interface TaskLog {
  text: string;
  level: TaskLogLevel;
}

export interface Task {
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
export const taskStore = new Map<string, Task>();

export function addTaskLog(
  taskId: string,
  text: string,
  level: TaskLogLevel = "log"
) {
  const task = taskStore.get(taskId);
  if (!task) return;
  task.logs.push({ text, level });
  task.updatedAt = Date.now();
}
