import {
   SourceSubscribeContentCore, SourceSubscribeList,
} from "@/types/SourceSubscribe";

export interface SubscribeDriver {
  /**
   * 获取订阅源列表
   */
  getSubscribeList(): Promise<Array<SourceSubscribeList>>;


  /**
   * 获取订阅源内容
   * @param link 链接
   */
  getSubscribeContent(link: string): Promise<SourceSubscribeContentCore>;
}