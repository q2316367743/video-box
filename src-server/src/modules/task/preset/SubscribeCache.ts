import {sourceSubscribeDao, sourceSubscribeRecordDao} from "@/dao";
import {pluginSubscribeRecordService} from "@/service/plugin/subscribe/PluginSubscribeRecordService";
import {error, info} from "@rasla/logify";
import {TaskRunnerContext} from "@/modules/task/TaskRunner";

export default async function (ctx: TaskRunnerContext) {
  // 获取全部需要缓存的订阅源
  const subscribes = await sourceSubscribeDao.query().eq('cache', 1).list();
  info(`获取全部需要缓存的订阅源，共有${subscribes.length}个`)

  for (let i = 0; i < subscribes.length; i++) {
    const subscribe = subscribes[i];
    info(`开始处理订阅源: ${subscribe.name}`);
    ctx.update(i / subscribes.length);
    const list = await pluginSubscribeRecordService(subscribe);
    let update = 0;
    let insert = 0;
    for (const item of list) {
      try {
        const old = await sourceSubscribeRecordDao.query().eq('link', item.link).one();
        if (old) {
          // 存在历史的订阅，更新
          await sourceSubscribeRecordDao.updateById(old.id, {
            ...item,
            updated_at: Date.now()
          });
          update += 1;
        } else {
          // 不存在历史的，新增
          await sourceSubscribeRecordDao.insert({
            ...item,
            subscribe_id: subscribe.id,
            created_at: Date.now(),
            updated_at: Date.now(),
          });
          insert += 1;
        }
      } catch (e) {
        console.error(e);
        error(`处理订阅「${subscribe.name}」出错: ` + ((e instanceof Error) ? e.message : String(e)))
      }
    }
    info(`处理订阅「${subscribe.name}」完成，新增 ${insert} 条，更新 ${update} 条`);
  }
  info("处理完成")
}