import {VideoSourceEntry} from "@/entities/VideoSource";

export interface VideoPageResult {
  // 当前页
  page: number;
  // 每页数目
  limit: number;
  // 总数
  total: number;
}

export interface VideoCategory {
  id: string;
  cover: string;
  name: string;
  children: Array<VideoCategory>;
}

// 视频推荐
export interface VideoRecommend {
  id: string;
  cover: string;
  title: string;
  category: VideoCategory;
  titleEn: string;
  // 更新时间
  time: string;
  // 播放来源
  playFrom: string;
}

export interface VideoHome extends VideoPageResult {
  // 推荐
  recommends: Array<VideoRecommend>;
  // 分类
  categories: Array<VideoCategory>;
}

export interface VideoListItemChapter {
  id: string;
  name: string;
  items: Array<VideoListItemUrl>;
}
export interface VideoListItemUrl {
  // 视频名称
  name: string;
  // 视频地址
  url: string;
  // 视频时长
  duration?: string;
}

export interface VideoListItem {
  id: string;
  type: 'Movie' | 'Series'
  cover: string;
  // 标题
  title: string;
  // 标题
  subtitle: string;
  // 英文标题
  titleEn: string;
  // 标签
  types: Array<string>;
  // 演员表
  actors: Array<string>;
  // 编剧
  directors: Array<string>;
  // 导演
  writers: Array<string>;
  // 推荐
  blurb: string;
  // 备注
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
  // 内容，可能是html
  content: string;
  // 播放地址
  playUrls: Array<VideoListItemChapter>;
}


export interface VideoDetail extends VideoListItem {
  recommends: Array<VideoListItem>;
}

export interface VideoCommonResult extends VideoPageResult {
  data: Array<VideoListItem>;
}

export interface VideoCategoryResult extends VideoCommonResult {
}

export interface VideoSearchResult extends VideoCommonResult {
}

export interface VideoPlugin {

  props: VideoSourceEntry;

  /**
   * 获取首页数据
   * @param page 页码
   */
  home(page: number): Promise<VideoHome>;

  /**
   * 获取分类下的视频
   * @param categoryId 分类ID
   * @param page 页码
   */
  getVideos(categoryId: string, page: number): Promise<VideoCategoryResult>;

  /**
   * 根据关键字搜索视频
   * @param keyword 关键字
   * @param page 页码
   */
  searchVideos(keyword: string, page: number): Promise<VideoSearchResult>;

  /**
   * 获取视频的信息
   * @param video 视频信息
   */
  getDetail(video: VideoListItem): Promise<VideoDetail>;

}