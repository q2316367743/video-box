import {
  VideoCategoryResult,
  VideoDetail,
  VideoHome, VideoListItem,
  VideoPlugin,
  VideoSearchResult
} from "@/core/VideoPlugin";
import {getItem, removeItem, setItem} from "@/utils/utools/DbStorageUtil";
import {VideoSourceEntry} from "@/entities/VideoSource";

export abstract class AbsVideoPluginForStore implements VideoPlugin {

  abstract props: VideoSourceEntry;

  abstract getDetail(video: VideoListItem): Promise<VideoDetail>;

  abstract getVideos(categoryId: string, page: number): Promise<VideoCategoryResult>;

  abstract home(page: number): Promise<VideoHome>;

  abstract searchVideos(keyword: string, page: number): Promise<VideoSearchResult>;

  protected readonly id: string;
  private readonly prefix: string;

  protected constructor(id: string) {
    this.id = id;
    this.prefix = `/video/store/${this.id}`;
  }

  protected getItem<T>(key: string): T | null {
    return getItem<T>(this.prefix + key);
  }

  protected setItem<T>(key: string, value: T) {
    setItem(this.prefix + key, value)
  }

  private removeItem(key: string) {
    removeItem(this.prefix + key);
  }


}