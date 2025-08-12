import {sourceSubscribeContentDao, sourceSubscribeDao, sourceSubscribeMediaDao, sourceSubscribeRecordDao} from "@/dao";
import {pluginSubscribeRecordService} from "@/service/plugin/subscribe/PluginSubscribeRecordService";
import {error, info} from "@rasla/logify";
import {TaskRunnerContext} from "@/modules/task/TaskRunner";
import {SourceSubscribe} from "@/types/SourceSubscribe";
import {db} from "@/global/db";

export async function subscribeRefreshOne(subscribe: SourceSubscribe) {
  try {
    info(`开始处理订阅源: ${subscribe.name}`);
    const list = await pluginSubscribeRecordService(subscribe);
    let update = 0;
    let insert = 0;
    for (const item of list) {
      try {
        db.sql`BEGIN`;
        const old = await sourceSubscribeRecordDao.query().eq('link', item.link).one();
        if (old) {
          if (old.pub_date !== item.pub_date) {
            // 更新了
            await sourceSubscribeRecordDao.updateById(old.id, {
              title: item.title,
              description: item.description,
              pub_date: item.pub_date,
              link: item.link,
              updated_at: Date.now()
            });
            update += 1;
            // 删除旧的媒体资源
            await sourceSubscribeMediaDao.query().eq('record_id', old.id).delete();
            // 插入新的资源
            for (let media of item.media) {
              await sourceSubscribeMediaDao.insert({
                ...media,
                subscribe_id: subscribe.id,
                record_id: old.id,
                created_at: Date.now(),
              });
            }
            // 删除旧的内容
            await sourceSubscribeContentDao.query().eq('record_id', old.id).delete();
            // 插入新的内容
            await sourceSubscribeContentDao.insert({
              content: item.content,
              subscribe_id: subscribe.id,
              record_id: old.id,
              created_at: Date.now(),
              ai: '',
              link: item.link,
            })
          }
        }
        else {
          // 不存在历史的，新增
          const {id} = await sourceSubscribeRecordDao.insert({
            title: item.title,
            description: item.description,
            pub_date: item.pub_date,
            link: item.link,
            subscribe_id: subscribe.id,
            created_at: Date.now(),
            updated_at: Date.now(),
          });
          insert += 1;
          // 插入新的资源
          for (let media of item.media) {
            await sourceSubscribeMediaDao.insert({
              ...media,
              subscribe_id: subscribe.id,
              record_id: id,
              created_at: Date.now(),
            });
          }
          // 插入新的内容
          await sourceSubscribeContentDao.insert({
            content: item.content,
            subscribe_id: subscribe.id,
            record_id: id,
            created_at: Date.now(),
            ai: '',
            link: item.link,
          })
        }
        // TODO：处理内容
        // 有内容规则才有内容，内部实现基于配置
        db.sql`COMMIT`;
      } catch (e) {
        console.error(e);
        error(`处理订阅「${subscribe.name}」出错: ` + ((e instanceof Error) ? e.message : String(e)));
        db.sql`ROLLBACK`;
      }
    }
    // 更新订阅源的记录数量
    const total = await sourceSubscribeRecordDao.query().eq('subscribe_id', subscribe.id).count();
    await sourceSubscribeDao.updateById(subscribe.id, {
      updated_at: Date.now(),
      record_count: total,
    })
    info(`处理订阅「${subscribe.name}」完成，新增 ${insert} 条，更新 ${update} 条，当前总记录 ${total} 条`);
  } catch (e) {
    error(`处理订阅「${subscribe.name}」出错: ` + ((e instanceof Error) ? e.message : String(e)))
  }
}

export default async function (ctx: TaskRunnerContext) {
  // 获取全部需要缓存的订阅源
  const subscribes = await sourceSubscribeDao.query()
    .ne('display', 7).list();
  info(`获取全部需要缓存的订阅源，共有${subscribes.length}个`)

  for (let i = 0; i < subscribes.length; i++) {
    ctx.update(i / subscribes.length);
    const subscribe = subscribes[i];
    await subscribeRefreshOne(subscribe);
  }
  info("处理完成")
}