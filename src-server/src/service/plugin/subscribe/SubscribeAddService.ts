import {SourceSubscribePostParam} from "@/types/SourceSubscribe";
import {beginTransactional} from "@/utils/SqlUtil";
import {sourceSubscribeDao, sourceSubscribeRuleDao} from "@/dao";
import {subscribeRefreshOne} from "@/modules/task/preset/SubscribeCache";

export async function subscribeAddService(param: SourceSubscribePostParam) {
  // 先获取基本信息

  const s = await beginTransactional(async () => {
    // 创建订阅源
    const subscribe = await sourceSubscribeDao.insert({
      name: param.name,
      description: param.description,
      url: param.url,
      link: param.link,
      display: param.display,
      type: param.type,
      driver: param.driver,
      icon: param.icon,
      order: 0,
      updated_at: Date.now(),
      group: param.group,
      record_count: 0,
      created_at: Date.now(),
      ai: param.ai
    });
    // 创建规则
    await sourceSubscribeRuleDao.insert({
      subscribe_id: subscribe.id,
      data: JSON.stringify(param.rule.data),
      list: param.rule.list,
      item_title: param.rule.item_title,
      item_description: param.rule.item_description,
      item_pub_date: param.rule.item_pub_date,
      item_link: param.rule.item_link,
      item_content: param.rule.item_content,
      item_charset: param.rule.item_charset,
    });
    return subscribe;
  });
  // 刷新缓存
  await subscribeRefreshOne(s);
}