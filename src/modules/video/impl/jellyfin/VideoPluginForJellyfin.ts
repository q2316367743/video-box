import {AbsVideoPluginForStore} from "@/modules/video/abs/AbsVideoPluginForStore";
import {VideoSource} from "@/entities/VideoSource";
import {VideoCategoryResult, VideoDetail, VideoHome, VideoListItem, VideoSearchResult} from "@/modules/video/VideoPlugin";
import {AxiosRequestConfig} from "axios";
import Constant from "@/global/Constant";
import {useRequest} from "@/hooks/HttpRequest";

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

  getDetail(video: VideoListItem): Promise<VideoDetail> {
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