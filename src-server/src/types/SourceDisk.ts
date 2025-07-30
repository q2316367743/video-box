export type DiskDriver = 'A_LIST_V3' | 'WEB_DAV';

export interface DiskSourceForm {
  title: string;
  // 驱动
  driver: DiskDriver;
  data: any;
  // 要扫描的路径路径
  path: string;
}

export interface DiskSourceEntry extends DiskSourceForm {
  id: string;
  createTime: number;
}