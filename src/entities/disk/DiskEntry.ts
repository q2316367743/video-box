import {DiskDriver, DiskSource} from "@/entities/disk/DiskSource.ts";

/**
 * 网络硬盘节目章节，一个章节就是一个视频文件
 */
export interface DiskProgramChapter {
  id: string;
  // 封面图
  cover: string;
  // 名字
  name: string;
  // 简介
  description: string;
  // 文件路径
  path: string;
}

/**
 * 网络硬盘节目会话，一个会话就是一个文件夹
 */
export interface DiskProgramSession {
  id: string;
  // 名字
  name: string;
  // 简介
  description: string;
  // 所有的节目章节
  chapters: Array<DiskProgramChapter>;
}

export interface DiskProgramActor{
  name: string;
  role: string;
  // 封面
  thumb: string;
  // 类型，和角色一致
  type?: string;
  // 排序
  order?: string;
}

/**
 * 网络硬盘节目，一个节目就是一个nfo
 */
export interface DiskProgram {
  id: string;

  // 描述
  description: string;

  // --------------------- nfo信息 ---------------------

  // 名字
  title: string;
  // 原始标题
  originalTitle: string;
  userRating: number;
  plot: string;
  // 分级
  mpaa: string;
  // 国家
  country: string;
  uniqueId: string;
  // 编号
  num: string;
  // 网站
  website: string;

  // 流派
  genre: Array<string>;
  // 标签
  tag: Array<string>;
  // 集合
  set: {
    // 名字
    name: string;
    // 简介
    overview: string;
  }

  // 制作商
  maker: string;
  // 演职员名单
  credits: Array<string>;
  // 导演
  directors: Array<string>;
  // 工作室
  studio: string;
  // 演员名单
  actors: Array<DiskProgramActor>;

  // 首次公演时间，yyyy-mm-dd
  premiered: string;
  // 发布时间，yyyy-mm-dd
  releaseDate: string;
  // 发布时间，同releaseDate，yyyy-mm-dd
  release?: string;
  // 添加时间，yyyy-mm-dd hh:mm:ss
  dateAdded: string;
  // 年份，yyyy
  year: string;

  // 封面
  poster: string;
  // 快照
  thumb: string;
  // 剧照
  fanart: string;
  // 封面
  cover: string;

  // 全部的季
  sessions: Array<DiskProgramSession>;
}

export interface DiskEntry {
  id: string;
  // 一个节目
  programs: Array<DiskProgram>;
}

export interface DiskInfo extends DiskEntry, DiskSource<DiskDriver> {

}