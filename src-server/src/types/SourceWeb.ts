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
}


export interface SourceWebView {
  id: string;
  create_time: number;
  update_time: number;
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