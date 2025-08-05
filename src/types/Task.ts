export type TaskType = 'preset' | 'adhoc';
export type TaskTrigger = 'cron' | 'manual' | 'internal';
export type TaskStatus = 'running' | 'done' | 'failed' | 'cancelled';

export interface TaskDefinition {
  id: string;
  name: string;
  type: TaskType;
  schedule: string;
  // preset 任务必填
  script: string;
  // 最后执行时间
  last_run_at: number;
}

export interface TaskExecution {
  id: string;
  definition_id: string;   // 临时任务可为空
  identifier: string;
  trigger: TaskTrigger;
  status: TaskStatus;
  created_at: number;
  finished_at: number;
  progress: number;
  result?: any;
  error?: string;
}
