export interface NetworkDiskFromAList {
  url: string;
  username: string;
  password: string;
  token: string;
}

export interface NetworkDiskFromWebDAV {
  url: string;
  username: string;
  password: string;
}


export interface NetworkDiskMap {
  ALIST: NetworkDiskFromAList;
  WEB_DAV: NetworkDiskFromWebDAV;
}

export type NetworkDiskType = keyof NetworkDiskMap;

export interface NetworkDisk<K extends NetworkDiskType> {
  id: string;
  createTime: number;
  updateTime: number;
  title: string;
  type: K;
  prop: NetworkDiskMap[K];
}