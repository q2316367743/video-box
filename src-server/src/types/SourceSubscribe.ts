import {YesOrNoType} from "@/global/constant";

// 订阅类型：RSS-1，内部订阅-2，自定义订阅-3
export type SourceSubscribeType = 1 | 2 | 3;
// 展示方式：1-文章，2-社交媒体，3-图片，4-视频，5-音频，6-通知
export type SourceSubscribeDisplay = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * 订阅源
 */
export interface SourceSubscribe {
  id: string;
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
  created_at: number;
  updated_at: number;
  // 是否缓存，不缓存每次都是最新的列表
  cache: YesOrNoType;
}
