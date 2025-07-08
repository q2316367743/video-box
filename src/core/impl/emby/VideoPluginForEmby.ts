import {AbsVideoPluginForStore} from "@/core/abs/AbsVideoPluginForStore";
import {VideoSource} from "@/entities/VideoSource";
import {
  VideoCategoryResult, VideoCommonResult,
  VideoDetail,
  VideoHome,
  VideoListItem,
  VideoRecommend,
  VideoSearchResult
} from "@/core/VideoPlugin";
import {AxiosError, AxiosRequestConfig} from "axios";
import Constant from "@/global/Constant";
import {EmbyAuthenticateByName} from "@/core/impl/emby/types/EmbyAuthenticateByName";
import MessageUtil from "@/utils/modal/MessageUtil";
import {EmbyItems} from "@/core/impl/emby/types/EmbyItems";
import {EmbyResume} from "@/core/impl/emby/types/EmbyResume";
import {EmbyItemInfo} from "@/core/impl/emby/types/EmbyItemsInfo";

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
        const {data} = await window.preload.lib.axiosInstance.request({
          url: '/emby/Users/authenticatebyname',
          method: 'POST',
          data: formData,
          responseType: 'json'
        });
        profile = data as EmbyAuthenticateByName;
        this.setItem('profile', profile);
      } catch (e) {
        MessageUtil.error(((e as AxiosError).response?.data as string) || ('登录失败，' + ((e as Error).message || `${e}`)))
        return Promise.reject(e);
      }
    }
    return profile;

  }

  private async request<T>(config: AxiosRequestConfig) {
    let profile = await this.getProfile();
    try {
      const {data} = await window.preload.lib.axiosInstance.request<T>({
        ...config,
        baseURL: this.props.props.url,
        params: {
          ...config.params,
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

  async getDetail(video: VideoListItem): Promise<VideoDetail> {
    let profile = await this.getProfile();
    const res = await this.request<EmbyItemInfo>({
      url: `/emby/Users/${profile.User.Id}/Items/${video.id}`,
      params: {}
    });
    return {
      ...video,
      types: res.Genres,
      actors: res.People.filter(e => e.Type === 'Actor').map(e => e.Name),
      directors: [],
      writers: [],
      blurb: "",
      remark: "",
      releaseDate: res.PremiereDate,
      total: res.ChildCount,
      region: "",
      language: res.OfficialRating || '',
      duration: "",
      content: "",
      playUrls: [],
      // TODO: 推荐
      recommends: []
    }
  }

  private embyItemsToItem(page: number, res: EmbyItems): VideoCommonResult {
    return {
      page,
      limit: 20,
      total: res.TotalRecordCount,
      data: res.Items.filter(e => e.MediaType === 'Video').map(e => ({
        id: e.Id,
        type: e.Type,
        cover: `${this.props.props.url}/emby/Items/70/Images/Thumb?maxWidth=300&tag=${e.ImageTags.Thumb || e.ImageTags.Primary}&quality=90`,
        title: e.Name,
        subtitle: '',
        titleEn: '',
        types: [],
        actors: [],
        directors: [],
        writers: [],
        blurb: "",
        remark: "",
        releaseDate: "",
        total: 0,
        region: "",
        language: "",
        releaseYear: e.ProductionYear + '',
        duration: "",
        content: "",
        playUrls: []
      } as VideoListItem))
    };
  }

  async getVideos(categoryId: string, page: number): Promise<VideoCategoryResult> {
    let profile = await this.getProfile();
    const res = await this.request<EmbyItems>({
      url: `/emby/Users/${profile.User.Id}/Items`,
      params: {
        "IncludeItemTypes": "Movie",
        "Fields": "BasicSyncInfo,CanDelete,CanDownload,PrimaryImageAspectRatio,ProductionYear,Status,EndDate",
        "StartIndex": (page - 1) * 20,
        "SortBy": "SortName",
        "SortOrder": "Ascending",
        "ParentId": categoryId,
        "EnableImageTypes": "Primary,Backdrop,Thumb",
        "ImageTypeLimit": 1,
        Recursive: true,
        Limit: 20
      }
    });

    return {
      ...this.embyItemsToItem(page, res)
    };

  }

  async home(page: number): Promise<VideoHome> {
    // 获取推荐
    let profile = await this.getProfile();
    const res = await this.request<EmbyResume>({
      url: `/emby/Users/${profile.User.Id}/Items/Resume`,
      params: {
        "Recursive": "true",
        "Fields": "BasicSyncInfo,CanDelete,CanDownload,PrimaryImageAspectRatio,ProductionYear",
        "ImageTypeLimit": "1",
        "EnableImageTypes": "Primary,Backdrop,Thumb",
        "MediaTypes": "Video",
        "Limit": "20"
      }
    })
    return {
      page,
      limit: 20,
      total: res.TotalRecordCount,
      categories: [],
      recommends: res.Items.map(e => ({
        id: e.Id,
        title: e.Name,
        titleEn: '',
        cover: `${this.props.props.url}/emby/Items/70/Images/Thumb?maxWidth=300&tag=${e.ImageTags.Thumb || e.ImageTags.Primary}&quality=90`,
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
    const res = await this.request<EmbyItems>({
      url: `/emby/Users/${profile.User.Id}/Items`,
      params: {
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
      }
    })
    return {
      ...this.embyItemsToItem(page, res)
    };
  }

}