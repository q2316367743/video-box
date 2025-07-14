/**
 * 播放历史项
 */
export interface PlayHistoryItem {
  id: string;
  createTime: number;
  // 类型，tv-直播，web-网络资源，disk-云盘
  type: 'tv' | 'web' | 'disk'

  cover: string;
  title: string;
  // 描述
  description: string;
}

export interface PlayHistoryPayload<T = any> {
  payload: T;
}

export interface PlayHistoryContent<T = any> extends PlayHistoryItem, PlayHistoryPayload<T> {

}