import {Cron} from 'croner';
import {error, info} from '@rasla/logify'
import {runner} from "@/modules/task/TaskRunner";
import {taskDefinitionDao} from "@/dao";

export async function loadCron() {
  const rows = await taskDefinitionDao.query().eq('type', 'preset').list();
  for (const def of rows) {
    if (!def.schedule) continue;
    Cron(def.schedule, () => {
      runner.start(def.id, 'cron', def.id)
        .then(() => {
          info(`✅ 任务「${def.name}(${def.id})」添加成功`);
        }).catch((e) => {
        error(`❌ 任务「${def.name}(${def.id})」添加失败：` + (e instanceof Error ? e.message : `${e}`));
        console.error(e);
      });
    });
  }
}