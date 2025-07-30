import {useGet} from "@/apis/common.ts";

export type DirItem = {
  // 名字
  name: string;
  // 拓展名
  extname: string;
  // 路径,唯一标识
  path: string;
  // 所在目录
  folder: string;
  // 类型
  type: 'file' | 'folder' | 'unknow'
  // 文件大小
  size: number;
  // 最后修改时间
  lastModified: number | string;
  // 拓展信息
  expands?: Record<string, any>;
  // 可能存在的封面,忽略
  cover?: string;
};

export function pluginDiskReadDir(sourceId: string, path: string) {
  return useGet<Array<DirItem>>(`/api/plugin/disk/read-dir/${sourceId}`, {path});
}