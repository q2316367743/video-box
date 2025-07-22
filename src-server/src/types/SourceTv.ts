
export interface SourceTv {
  id: string;
  create_time: number;
  update_time: number;
  name: string;
  url: string;
  timeout: number;
  length: number;
  refresh_time: number;
  refresh_status: number;
}

/**
 * 一个直播视频
 */
export interface SourceTvChannel {
  id: string;
  create_time: number;
  logo: string;
  name: string;
  url: string;
  group: string;
}

export interface SourceTvInfo extends SourceTv {
  channels: Array<SourceTvChannel>;
}
