// 类型，1-热点，2-实时
export type SourceNewsType = 1 | 2;

/**
 * 新闻资讯
 */
export interface SourceNews {
  id: string;
  created_at: number;
  updated_at: number;
  is_enabled: number;

  logo: string;
  title: string;
  // 标签
  tag: string;
  // 主题色
  primary_color: string;
  // 站点
  website: string;

  type: SourceNewsType;
  // 排序
  order: number;
}

/**
 * 新闻资讯脚本
 */
export interface SourceNewsContent {
  id: string;

  // 唯一
  news_id: string;
  script: string;
}

export interface SourceNewsPost {
  is_enabled: boolean;
  logo: string;
  title: string;
  // 标签
  tag: string;
  // 主题色
  primary_color: string;
  // 站点
  website: string;

  type: SourceNewsType;
  // 排序
  order: number;
  script: string;
}

export interface SourceNewsInfoView extends SourceNews {
  script: string;
  records: Array<SourceNewsRecord>;
}

export interface SourceNewsRecordTag {
  color?: string;
  text: string;
  ing?: boolean;
  type?: 'default' | 'outline' | 'img';
}

/**
 * 一条记录
 */
export interface SourceNewsRecord {
  // id
  id: string;
  created_at: number;
  updated_at: number;

  news_id: string;

  // 标题
  title: string;
  // 链接，这个是唯一的
  url: string;
  // 是否已读
  read: number;
  // 提示
  hover: string;

  // 更新日期
  date: string;

  /**
   * 标签
   * @see SourceNewsRecordTag
   */
  tag: string;

  // 提示
  tip: string;
  // 排序
  order: number;
}

/**
 * 一条记录，渲染结果
 */
export interface SourceNewsRecordView {

  // 标题
  title: string;
  // 链接
  url: string;
  // 提示
  hover: string;

  // 更新日期
  date: string;

  /**
   * 标签
   */
  tag: SourceNewsRecordTag | false;

  // 提示
  tip: string;
}

export interface SourceNewsItem extends SourceNews {
  records: Array<SourceNewsRecord>;
}