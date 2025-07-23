// src/taskStore.ts
export type TaskStatus = "pending" | "running" | "success" | "failed";
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

