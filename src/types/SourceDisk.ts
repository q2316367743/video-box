export type DiskDriver = 'A_LIST_V3' | 'WEB_DAV';

export interface DiskSourceFormData {
  title: string;
  // 驱动
  driver: DiskDriver;
  data: Record<string, any>;
}

export interface DiskSourceEntry extends DiskSourceFormData {
  id: string;
  create_time: number;
  update_time: number;
  order: number;
}