import {Cron} from 'croner';
import {error, info} from '@rasla/logify'
import {runner} from "@/modules/task/TaskRunner";
import {taskDefinitionDao} from "@/dao";
import dayjs from "dayjs";

// 任务映射，用于立马执行任务
export const jobMap = new Map<string, Cron>();

export async function loadCron() {
  const rows = await taskDefinitionDao.query().eq('type', 'preset').list();
  for (const def of rows) {
    if (!def.schedule) continue;
    const job = Cron(def.schedule, {
      name: def.name,
      timezone: 'Asia/Shanghai',
    }, () => {
      runner.start(def.id, 'cron', def.id)
        .then(() => {
          info(`✅ 任务「${def.name}(${def.id})」执行成功`);
        }).catch((e) => {
        error(`❌ 任务「${def.name}(${def.id})」执行失败：` + (e instanceof Error ? e.message : `${e}`));
        console.error(e);
      });
    });
    const nextRun = job.nextRun();
    info(`🚀 创建定时任务「${job.name}」，下次执行时间：${nextRun ? dayjs(nextRun).format("YYYY-MM-DD HH:mm:ss") : '未知'}`);
    jobMap.set(def.id, job);
  }
}