import {YesOrNoType} from "@/global/constant";

// 订阅类型：RSS-1, rss hub-2，内部订阅-3，自定义订阅-4
export type SourceSubscribeType = 1 | 2 | 3;
// 展示方式：1-文章，2-社交媒体，3-图片，4-视频，5-音频，6-通知
export type SourceSubscribeDisplay = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * 订阅源
 * @see https://docs.rsshub.app/zh/
 */
export interface SourceSubscribe {
  id: string;
  created_at: number;
  updated_at: number;
  // 分组ID
  group_id: string;
  // 类型
  type: SourceSubscribeType;
  // 使用的驱动，只有内部订阅有效
  driver: string;
  // 展示方式
  display: SourceSubscribeDisplay;
  name: string;
  description: string;
  url: string;
  icon: string;
  /**
   * 是否缓存，不缓存每次都是最新的列表，内容也是新的，无法使用ai
   * @default 1
   */
  cache: YesOrNoType;
  /**
   * 是否使用AI
   * @default 0
   */
  ai: YesOrNoType;
  // 排序
  order: number;
  // 记录数量
  record_count: number;
}

/**
 * 订阅分组
 */
export interface SourceSubscribeGroup {
  id: string;
  created_at: number;
  updated_at: number;
  name: string;
  description: string;
  order: number;
}

/**
 * 订阅规则
 * @see https://app.follow.is/discover?type=transform
 */
export interface SourceSubscribeRule {
  id: string;
  subscribe_id: string;

  // ======================= 内部订阅 =======================

  data: string;

  // ======================= 自定义订阅 =======================

  // 列表规则
  list: string;
  // 标题规则
  item_title: string;
  // 描述规则
  item_description: string;
  // 最后更新时间
  item_pub_date: string;
  // 连接规则
  item_link: string;
  // 媒体规则
  item_media: string;

  // 内容规则
  item_content: string;
  // 编码规则
  item_charset: string;

}

/**
 * 订阅源 RSS Hub 实例
 */
export interface SourceSubscribeRssHub {
  id: string;
  created_at: number;
  updated_at: number;
  name: string;
  description: string;
  url: string;
  // 刷新时间
  refresh_time: number;
  // 重试次数
  retry_count: number;
  // 延迟时间
  delay_time: number;
  // 是否启用
  is_enabled: number;
}

export interface SourceSubscribeList {

  title: string;
  description: string;
  // 最后更新时间
  pub_date: number;
  media: string;
  // 唯一
  link: string;
}

/**
 * 订阅浏览记录
 */
export interface SourceSubscribeRecord extends SourceSubscribeList {
  id: string;
  created_at: number;
  updated_at: number;
  // 所属订阅源
  subscribe_id: string;
  read_status: YesOrNoType;
}

export interface SourceSubscribeContentCore {

  // 原文链接
  link: string;

  /**
   * 实际内容
   */
  content: string;
}

/**
 * 订阅内容
 */
export interface SourceSubscribeContent extends SourceSubscribeContentCore{
  id: string;
  created_at: number;
  updated_at: number;

  // 所属订阅源
  subscribe_id: string;

  /**
   * AI总结
   */
  ai: string;

}
