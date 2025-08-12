import {
  SourceSubscribeContentCore, SourceSubscribeDisplay, SourceSubscribeRecordView,
} from "@/types/SourceSubscribe";

export interface SubscribeDriver {

  /**
   * 推荐的展示方案
   */
  display: SourceSubscribeDisplay;

  /**
   * 是否支持查看内容，如果不支持，则展示描述
   */
  supportContent: boolean;

  /**
   * 获取订阅源列表
   */
  getSubscribeList(): Promise<Array<SourceSubscribeRecordView>>;

  /**
   * 获取订阅源内容
   * @param link 链接
   */
  getSubscribeContent(link: string): Promise<SourceSubscribeContentCore>;
}