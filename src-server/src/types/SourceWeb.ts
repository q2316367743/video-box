export interface SourceWeb {
  id: string;
  create_time: number;
  update_time: number;
  title: string;
  type: number;
  props: Record<string, any>;

  // 图标
  favicon: string;
  // 所在文件夹
  folder: string;
  // 排序
  order: number;
}