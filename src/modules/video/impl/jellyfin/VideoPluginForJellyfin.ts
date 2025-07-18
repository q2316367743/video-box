import {AbsVideoPluginForStore} from "@/modules/video/abs/AbsVideoPluginForStore.js";
import {VideoSource} from "@/entities/VideoSource.js";
import {
  VideoCategoryResult,
  VideoDetail,
  VideoHome,
  VideoListItem,
  VideoSearchResult
} from "@/modules/video/VideoPlugin.js";
import {AxiosRequestConfig} from "axios";
import Constant from "@/global/Constant.js";
import {useRequest} from "@/hooks/HttpRequest.js";

export interface VideoPluginForJellyfinProps {
  url: string;
  username: string;
  password: string;
}

export class VideoPluginForJellyfin extends AbsVideoPluginForStore {

  public props: VideoSource<'JELLYFIN'>;

  constructor(props: VideoSource<'JELLYFIN'>) {
    super(props.id);
    this.props = props;
  }

  private async request<T>(config: AxiosRequestConfig) {
    const token = this.getItem('token')
    const {data} = await useRequest('', {
      ...config,
      params: {
        ...config.params,
        "X-Emby-Client": Constant.id,
        "X-Emby-Device-Name": Constant.name,
        "X-Emby-Device-Id": Constant.id,
        "X-Emby-Client-Version": Constant.version,
        "X-Emby-Token": token,
        "X-Emby-Language": "zh-cn"
      }
    });

  }

  getDetail(video: VideoListItem | string): Promise<VideoDetail> {
    return Promise.resolve({} as VideoDetail);
  }

  getVideos(categoryId: string, page: number): Promise<VideoCategoryResult> {
    return Promise.resolve({} as VideoCategoryResult);
  }

  home(page: number): Promise<VideoHome> {
    return Promise.resolve({} as VideoHome);
  }

  searchVideos(keyword: string, page: number): Promise<VideoSearchResult> {
    return Promise.resolve({} as VideoSearchResult);
  }

}