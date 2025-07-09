export interface M3u8Core {
  id: number;
  // 频道名称
  name: string;
  // 链接，有链接才能刷新
  url: string;
  // 是否检测是否超时
  disableTimeout: boolean;
}

export interface LiveSource extends M3u8Core {
  // 最后更新时间
  updateTime: number;
  // 一共有多少个频道
  length: number;
  // 最后一次是否成功
  success: boolean;
}

/**
 * 一个直播视频
 */
export interface M3u8Channel {
  id: string;
  logo: string;
  name: string;
  url: string;
  group: string;
}

export interface M3u8Group {
  group: string;
  items: Array<M3u8Channel>;
}

export interface LiveSourceInfo extends LiveSource {
  channels: Array<M3u8Channel>;
}

export function buildM3u8Core(): M3u8Core {
  return {id: 0, name: '', url: '', disableTimeout: false};
}

export interface M3u8ChannelWrap extends M3u8Channel {
  // 禁用超时检测
  disableTimeout: boolean;
}
