import {SourceWebView} from "@/types/SourceWeb";

export interface WebPageResult {
  // 当前页
  page: number;
  // 每页数目
  limit: number;
  // 总数
  total: number;
}

export interface WebCategory {
  id: string;
  cover: string;
  name: string;
  children: Array<WebCategory>;
}

// 视频推荐
export interface WebRecommend {
  id: string;
  cover: string;
  title: string;
  category: WebCategory;
  titleEn?: string;
  // 更新时间
  time: string;
  // 播放来源
  playFrom: string;
  // 备注
  remark?: string;
}

export interface WebHome extends WebPageResult {
  // 推荐
  recommends: Array<WebRecommend>;
  // 分类
  categories: Array<WebCategory>;
}

export interface WebListItemChapter {
  id: string;
  name: string;
  items: Array<WebListItemUrl>;
}
export interface WebListItemUrl {
  // 视频名称
  name: string;
  // 视频地址
  url: string;
  // 视频时长
  duration?: string;
}

export interface WebListItem {
  id: string;
  type: 'Movie' | 'Series'
  cover: string;
  // 标题
  title: string;
  // 副标题
  subtitle: string;
  // 标签
  types: Array<string>;
  // 演员表
  actors: Array<string>;
  // 编剧
  directors: Array<string>;
  // 导演
  writers: Array<string>;
  // 备注,更新至多少集
  remark: string;
  // 上映时间
  releaseDate: string;
  // 总集数
  total: number;
  // 地区
  region: string;
  // 语言
  language: string;
  // 上映年份
  releaseYear: string;
  // 每集时长
  duration: string;
  // 内容，剧情简介，可能是html
  content: string;
  // 章节目录
  chapters: Array<WebListItemChapter>;
}


export interface WebDetail extends WebListItem {
  recommends: Array<WebListItem>;
}

export interface WebCommonResult extends WebPageResult {
  data: Array<WebListItem>;
}

export interface WebCategoryResult extends WebCommonResult {
}

export interface WebSearchResult extends WebCommonResult {
}

export interface WebPlugin {

  props: SourceWebView;

  /**
   * 获取首页数据
   * @param page 页码
   */
  home(page: number): Promise<WebHome>;

  /**
   * 获取分类下的视频
   * @param categoryId 分类ID
   * @param page 页码
   */
  getWebs(categoryId: string, page: number): Promise<WebCategoryResult>;

  /**
   * 根据关键字搜索视频
   * @param keyword 关键字
   * @param page 页码
   */
  searchWebs(keyword: string, page: number): Promise<WebSearchResult>;

  /**
   * 获取视频的信息
   * @param video 视频信息ID
   */
  getDetail(video: WebListItem | string): Promise<WebDetail>;

}