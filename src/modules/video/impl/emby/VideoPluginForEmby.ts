import {AbsVideoPluginForStore} from "@/modules/video/abs/AbsVideoPluginForStore.js";
import {VideoSource} from "@/entities/VideoSource.js";
import {
  VideoCategoryResult, VideoCommonResult,
  VideoDetail,
  VideoHome,
  VideoListItem,
  VideoRecommend,
  VideoSearchResult
} from "@/modules/video/VideoPlugin.js";
import {AxiosError} from "axios";
import Constant from "@/global/Constant.js";
import {EmbyAuthenticateByName} from "@/modules/video/impl/emby/types/EmbyAuthenticateByName.js";
import MessageUtil from "@/utils/modal/MessageUtil.js";
import {EmbyItems} from "@/modules/video/impl/emby/types/EmbyItems.js";
import {EmbyResume} from "@/modules/video/impl/emby/types/EmbyResume.js";
import {EmbyItemInfo} from "@/modules/video/impl/emby/types/EmbyItemsInfo.js";
import {EmbyPlaybackInfo} from "@/modules/video/impl/emby/types/EmbyPlaybackInfo.js";
import {EmbyView} from "@/modules/video/impl/emby/types/EmbyView.js";
import {useRequest} from "@/hooks/HttpRequest.js";

export interface VideoPluginForEmbyProps {
  url: string;
  username: string;
  password: string;

}

export class VideoPluginForEmby extends AbsVideoPluginForStore {

  public props: VideoSource<'EMBY'>;
  private readonly PARAMS: Record<string, string> = {
    "X-Emby-Client": Constant.id,
    "X-Emby-Device-Name": Constant.name,
    "X-Emby-Device-Id": Constant.id,
    "X-Emby-Client-Version": Constant.version,
    "X-Emby-Language": "zh-cn"
  }

  constructor(props: VideoSource<'EMBY'>) {
    super(props.id);
    this.props = props;
  }

  private async getProfile() {
    let profile = this.getItem<EmbyAuthenticateByName>('profile');
    if (!profile) {
      try {
        // 登录
        const formData = new FormData();
        formData.append('Username', this.props.props.username);
        formData.append('Pw', this.props.props.password);
        const {data} = await useRequest('/emby/Users/authenticatebyname', {
          baseURL: this.props.props.url,
          method: 'POST',
          data: formData,
          responseType: 'json',
          params: this.PARAMS,
          headers: {
            'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 QuarkPC/4.2.0.418"
          }
        });
        profile = data as EmbyAuthenticateByName;
        this.setItem('profile', profile);
      } catch (e) {
        console.error(e);
        MessageUtil.error(((e as AxiosError).response?.data as string) || ('登录失败，' + ((e as Error).message || `${e}`)))
        return Promise.reject(e);
      }
    }
    return profile;

  }

  private async request<T>(url: string, params?: Record<string, any>) {
    let profile = await this.getProfile();
    try {
      const {data} = await useRequest<T>(url, {
        baseURL: this.props.props.url,
        params: {
          ...params,
          ...this.PARAMS,
          "X-Emby-Token": profile.AccessToken,
        }
      });
      return data;
    } catch (e) {
      // TODO: 此处考虑登录过期
      // this.removeItem('profile');
      // return this.request(config);
      MessageUtil.error(((e as AxiosError).response?.data as string) || ('请求失败，' + ((e as Error).message || `${e}`)))
      return Promise.reject(e);
    }

  }

  async getDetail(video: VideoListItem | string): Promise<VideoDetail> {
    const videoId = typeof video === 'string' ? video : video.id;
    let profile = await this.getProfile();
    const [res, info, rec] = await Promise.all([
      // 基础信息
      this.request<EmbyItemInfo>(`/emby/Users/${profile.User.Id}/Items/${videoId}`, {}),
      // 播放信息
      this.request<EmbyPlaybackInfo>(`/emby/Items/${videoId}/PlaybackInfo`, {
        UserId: profile.User.Id,
        StartTimeTicks: 0,
        IsPlayback: false,
        AutoOpenLiveStream: false,
        MaxStreamingBitrate: 200000000,
        reqformat: "json"
      }),
      // 推荐信息
      this.request<EmbyItems>(`/emby/Items/${videoId}/Similar`, {
        Limit: 12,
        UserId: profile.User.Id,
        ImageTypeLimit: 1,
        Fields: "BasicSyncInfo,CanDelete,CanDownload,PrimaryImageAspectRatio,ProductionYear,Status,EndDate",
        EnableTotalRecordCount: false
      })]);
    return {
      cover: res.ImageTags.Primary,
      id: res.Id,
      releaseYear: res.ProductionYear + '',
      subtitle: res.SortName,
      title: res.Name,
      // TODO: 此处异常
      type: res.Type === 'Series' ? 'Series' : 'Movie',
      types: res.Genres,
      actors: res.People.filter(e => e.Type === 'Actor').map(e => e.Name),
      directors: [],
      writers: [],
      remark: "",
      releaseDate: res.PremiereDate,
      total: res.ChildCount,
      region: "",
      language: res.OfficialRating || '',
      duration: "",
      content: "",
      chapters: [{
        id: encodeURIComponent(this.props.title),
        name: this.props.title,
        items: info.MediaSources.map(s => ({
          name: res.Name,
          url: `${this.props.props.url}/emby/videos/${videoId}/original.mp4?DeviceId=${Constant.id}&MediaSourceId=${s.Id}&PlaySessionId=${info.PlaySessionId}&api_key=${profile.AccessToken}`
        }))
      }],
      recommends: this.embyItemsToItem(1, rec).data
    }
  }

  private embyItemsToItem(page: number, res: EmbyItems): VideoCommonResult {
    return {
      page,
      limit: 20,
      total: res.TotalRecordCount,
      data: res.Items.filter(e => e.MediaType === 'Video' || e.Type === 'Series').map(e => ({
        id: e.Id,
        type: e.Type,
        cover: `${this.props.props.url}/emby/Items/${e.Id}/Images/Primary?maxHeight=450&maxWidth=300&tag=${e.ImageTags.Primary}&quality=90`,
        title: e.Name,
        subtitle: '',
        types: [],
        actors: [],
        directors: [],
        writers: [],
        remark: "",
        releaseDate: "",
        total: 0,
        region: "",
        language: "",
        releaseYear: e.ProductionYear + '',
        duration: "",
        content: "",
        chapters: []
      } as VideoListItem))
    };
  }

  async getVideos(categoryId: string, page: number): Promise<VideoCategoryResult> {
    let profile = await this.getProfile();
    const res = await this.request<EmbyItems>(`/emby/Users/${profile.User.Id}/Items`, {
      "IncludeItemTypes": "Movie,Series",
      "Fields": "BasicSyncInfo,CanDelete,CanDownload,PrimaryImageAspectRatio,ProductionYear,Status,EndDate",
      "StartIndex": (page - 1) * 20,
      "SortBy": "SortName",
      "SortOrder": "Ascending",
      "ParentId": categoryId,
      "EnableImageTypes": "Primary,Backdrop,Thumb",
      "ImageTypeLimit": 1,
      Recursive: true,
      Limit: 20
    });

    return {
      ...this.embyItemsToItem(page, res)
    };

  }

  async home(page: number): Promise<VideoHome> {
    // 获取推荐
    let profile = await this.getProfile();
    const [res, view] = await Promise.all([
      this.request<EmbyResume>(`/emby/Users/${profile.User.Id}/Items/Resume`, {
        "Recursive": "true",
        "Fields": "BasicSyncInfo,CanDelete,CanDownload,PrimaryImageAspectRatio,ProductionYear",
        "ImageTypeLimit": "1",
        "EnableImageTypes": "Primary,Backdrop,Thumb",
        "MediaTypes": "Video",
        "Limit": "20"
      }),
      this.request<EmbyView>(`/emby/Users/${profile.User.Id}/Views`, {})
    ])
    return {
      page,
      limit: 20,
      total: res.TotalRecordCount,
      categories: view.Items.map(e => ({
        id: e.Id,
        cover: e.ImageTags.Primary ? `http://10.20.30.2:8096/emby/Items/${e.Id}/Images/Primary?maxHeight=212&maxWidth=375&tag=${e.ImageTags.Primary}&quality=90` : '',
        name: e.Name,
        children: []
      })),
      recommends: res.Items.map(e => ({
        id: e.Id,
        title: e.Name,
        titleEn: '',
        cover: `${this.props.props.url}/emby/Items/${e.Id}/Images/Primary?maxHeight=450&maxWidth=300&tag=${e.ImageTags.Primary}&quality=90`,
        category: {
          id: '',
          children: [],
          cover: '',
          name: ''
        },
        playFrom: 'Emby',
        time: e.ProductionYear + '',
      } as VideoRecommend))
    }
  }

  async searchVideos(keyword: string, page: number): Promise<VideoSearchResult> {
    let profile = await this.getProfile();
    const res = await this.request<EmbyItems>(`/emby/Users/${profile.User.Id}/Items`, {
      'Fields': 'BasicSyncInfo,CanDelete,CanDownload,PrimaryImageAspectRatio,ProductionYear,Status,EndDate',
      "StartIndex": (page - 1) * 20,
      "SortBy": "SortName",
      "SortOrder": "Ascending",
      "EnableImageTypes": "Primary,Backdrop,Thumb",
      "ImageTypeLimit": 1,
      "Recursive": "true",
      "SearchTerm": keyword,
      "GroupProgramsBySeries": "true",
      "Limit": 20
    })
    return {
      ...this.embyItemsToItem(page, res)
    };
  }

}