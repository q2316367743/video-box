import { SourceWebTypeEnum } from "@/enum/SourceWebTypeEnum";

export interface SourceWeb {
  id: string;
  create_time: number;
  update_time: number;
  title: string;
  type: SourceWebTypeEnum;
  // 此处需要处理，本质是个json对象
  props: string;

  // 图标
  favicon: string;
  // 所在文件夹
  folder: string;
  // 排序
  order: number;

  // 刷新时间
  refresh_time: number;
  // 重试次数
  retry_count: number;
  // 延迟时间
  delay_time: number;
  // 是否启用
  is_enabled: number;
  // 官网
  detail: string;
}

export interface SourceWebView extends Omit<SourceWeb, "props" | "is_enabled"> {
  // 此处需要处理，本质是个json对象
  props: Record<string, any>;
  is_enabled: boolean;
}
