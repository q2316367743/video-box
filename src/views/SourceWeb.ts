import {SourceWebTypeEnum} from "@/enum/SourceWebTypeEnum";

export interface SourceWebForm {
  title: string;
  type: SourceWebTypeEnum;
  // 此处需要处理，本质是个json对象
  props: Record<string, any>;

  // 图标
  favicon: string;
  // 所在文件夹
  folder: string;
  // 排序
  order: number;
}

export interface SourceWeb extends SourceWebForm {
  id: string;
  create_time: number;
  update_time: number;
  // 刷新时间
  refresh_time: number;
  // 重试次数
  retry_count: number;
  // 延迟时间
  delay_time: number;

  // 是否启用
  is_enabled: boolean;
}
