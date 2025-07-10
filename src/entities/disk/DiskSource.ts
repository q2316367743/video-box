export interface DiskFromAList {
  url: string;
  username: string;
  password: string;
  token: string;
}

export interface DiskFromWebDAV {
  url: string;
  username: string;
  password: string;
}


export interface DiskMap {
  A_LIST: DiskFromAList;
  WEB_DAV: DiskFromWebDAV;
}

export type DiskDriver = keyof DiskMap;


// 类型，movie-电影、tvshow-剧集
export type DiskType = 'movie' | 'tvshow';


export interface DiskSourceForm<K extends DiskDriver> {
  // 媒体类型，设置后无法修改
  type: DiskType;
  title: string;
  // 驱动
  driver: K;
  data: DiskMap[K];
  // 要扫描的路径路径
  path: string;
}

export interface DiskSource<K extends DiskDriver> extends DiskSourceForm<K> {
  id: string;
  createTime: number;
  updateTime: number;
  // 刷新时间
  refreshTime: number;
}