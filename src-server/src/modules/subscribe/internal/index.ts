import {SourceSubscribe, SourceSubscribeRule} from "@/types/SourceSubscribe";
import {SubscribeDriver} from "@/modules/subscribe/SubscribeDriver";

export function buildInternalSubscribeDriver(subscribe: SourceSubscribe, rule: SourceSubscribeRule): SubscribeDriver {
  throw new Error("暂未实现")
}