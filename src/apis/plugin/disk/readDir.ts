import {useGet, usePost} from "@/apis/common.ts";

export interface DirCoreItem {
  // 路径，当前目录项的路径
  path: string;
  // 签名
  sign: string;
}

export interface DirItem<T extends Record<string, any> = Record<string, any>> extends DirCoreItem {
  // 名字，
  name: string;
  // 类型
  type: 'file' | 'folder' | 'unknow';
  // 所在目录
  folder: string;
  // 拓展名
  extname?: string;
  // 文件大小
  size?: number;
  // 最后修改时间
  lastModified?: number | string;
  // 拓展信息
  expands?: T;
  // 可能存在的封面,忽略
  cover?: string;
}
export interface PluginDiskReadDirData {
  // 签名
  path: string;
  // 是否刷新缓存
  refresh: boolean;
}

export function pluginDiskReadDir(sourceId: string, data: PluginDiskReadDirData) {
  return usePost<Array<DirItem>>(`/api/plugin/disk/read-dir/${sourceId}`, data);
}