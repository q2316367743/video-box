export type DiskDriver = 'A_LIST_V3' | 'WEB_DAV' | 'QUARK_OPEN' | 'QUARK' | 'UC';

export interface DiskSourceEntry {
  title: string;
  // 驱动
  driver: string;
  data: string;
  id: string;
  create_time: number;
  update_time: number;
  order: number;
}

export interface DiskSourceForm {
  title: string;
  // 驱动
  driver: DiskDriver;
  data: Record<string, any>;
}

export interface DiskSourceView extends DiskSourceForm {
  id: string;
  create_time: number;
  update_time: number;
}