import {SourceSubscribe, SourceSubscribeList} from "@/types/SourceSubscribe";
import {SubscribeDriverForRss} from "@/modules/subscribe/driver/SubscribeDriverForRss";
import {sourceSubscribeRuleDao} from "@/dao";
import {SubscribeDriverForRssHub} from "@/modules/subscribe/driver/SubscribeDriverForRssHub";
import {SubscribeDriver} from "@/modules/subscribe/SubscribeDriver";
import {SubscribeDriverForCustomer} from "@/modules/subscribe/driver/SubscribeDriverForCustomer";
import {buildInternalSubscribeDriver} from "@/modules/subscribe/internal";

export async function pluginSubscribeRecordService(subscribe: SourceSubscribe): Promise<Array<SourceSubscribeList>> {
  const rule = await sourceSubscribeRuleDao.query().eq('subscribe_id', subscribe.id).one();
  if (!rule) return Promise.reject(new Error("系统异常，订阅规则不存在"));
  let driver: SubscribeDriver;
  if (subscribe.type === 1) {
    // RSS
    driver = new SubscribeDriverForRss(subscribe, rule);
  } else if (subscribe.type === 2) {
    // rss hub
    driver = new SubscribeDriverForRssHub(subscribe, rule);
  } else if (subscribe.type === 3) {
    // 内部订阅
    driver = buildInternalSubscribeDriver(subscribe, rule);
  } else if (subscribe.type === 4) {
    // 自定义订阅
    driver = new SubscribeDriverForCustomer(subscribe, rule);
  }else {
    return Promise.reject(new Error("系统异常，订阅类型不存在"));
  }
  return driver.getSubscribeList()
}