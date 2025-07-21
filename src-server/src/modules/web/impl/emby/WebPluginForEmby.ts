import { AbsWebPluginForStore } from "@/modules/web/abs/AbsWebPluginForStore";
import { SourceWeb } from "@/types/SourceWeb";
import {
  WebCategoryResult,
  WebCommonResult,
  WebDetail,
  WebHome,
  WebListItem,
  WebRecommend,
  WebSearchResult,
} from "@/modules/web/WebPlugin.js";
import { EmbyAuthenticateByName } from "@/modules/web/impl/emby/types/EmbyAuthenticateByName.js";
import { EmbyItems } from "@/modules/web/impl/emby/types/EmbyItems.js";
import { EmbyResume } from "@/modules/web/impl/emby/types/EmbyResume.js";
import { EmbyItemInfo } from "@/modules/web/impl/emby/types/EmbyItemsInfo.js";
import { EmbyPlaybackInfo } from "@/modules/web/impl/emby/types/EmbyPlaybackInfo.js";
import { EmbyView } from "@/modules/web/impl/emby/types/EmbyView.js";
import { APP_ID, APP_NAME, APP_VERSION } from "@/global/constant";
import { useRequest } from "@/global/http";

export interface WebPluginForEmbyProps {
  url: string;
  username: string;
  password: string;
}

export class WebPluginForEmby extends AbsWebPluginForStore {
  public props: SourceWeb;
  private readonly PARAMS: Record<string, string> = {
    "X-Emby-Client": APP_ID,
    "X-Emby-Device-Name": APP_NAME,
    "X-Emby-Device-Id": APP_ID,
    "X-Emby-Client-Version": APP_VERSION,
    "X-Emby-Language": "zh-cn",
  };

  constructor(props: SourceWeb) {
    super(props.id);
    this.props = props;
  }

  private async getProfile() {
    let profile = await this.getItem<EmbyAuthenticateByName>("profile");
    if (!profile) {
      try {
        // 登录
        const formData = new FormData();
        formData.append("Username", this.props.props.username);
        formData.append("Pw", this.props.props.password);
        const { data } = await useRequest("/emby/Users/authenticatebyname", {
          baseURL: this.props.props.url,
          method: "POST",
          data: formData,
          responseType: "json",
          params: this.PARAMS,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 QuarkPC/4.2.0.418",
          },
        });
        profile = data as EmbyAuthenticateByName;
        await this.setItem("profile", profile);
      } catch (e) {
        console.error(e);
        return Promise.reject(e);
      }
    }
    return profile;
  }

  private async request<T>(url: string, params?: Record<string, any>) {
    let profile = await this.getProfile();
    try {
      const { data } = await useRequest<T>(url, {
        baseURL: this.props.props.url,
        params: {
          ...params,
          ...this.PARAMS,
          "X-Emby-Token": profile.AccessToken,
        },
      });
      return data;
    } catch (e) {
      // TODO: 此处考虑登录过期
      // this.removeItem('profile');
      // return this.request(config);
      return Promise.reject(e);
    }
  }

  async getDetail(web: WebListItem | string): Promise<WebDetail> {
    const webId = typeof web === "string" ? web : web.id;
    let profile = await this.getProfile();
    const [res, info, rec] = await Promise.all([
      // 基础信息
      this.request<EmbyItemInfo>(
        `/emby/Users/${profile.User.Id}/Items/${webId}`,
        {}
      ),
      // 播放信息
      this.request<EmbyPlaybackInfo>(`/emby/Items/${webId}/PlaybackInfo`, {
        UserId: profile.User.Id,
        StartTimeTicks: 0,
        IsPlayback: false,
        AutoOpenLiveStream: false,
        MaxStreamingBitrate: 200000000,
        reqformat: "json",
      }),
      // 推荐信息
      this.request<EmbyItems>(`/emby/Items/${webId}/Similar`, {
        Limit: 12,
        UserId: profile.User.Id,
        ImageTypeLimit: 1,
        Fields:
          "BasicSyncInfo,CanDelete,CanDownload,PrimaryImageAspectRatio,ProductionYear,Status,EndDate",
        EnableTotalRecordCount: false,
      }),
    ]);
    return {
      cover: res.ImageTags.Primary,
      id: res.Id,
      releaseYear: res.ProductionYear + "",
      subtitle: res.SortName,
      title: res.Name,
      // TODO: 此处异常
      type: res.Type === "Series" ? "Series" : "Movie",
      types: res.Genres,
      actors: res.People.filter((e) => e.Type === "Actor").map((e) => e.Name),
      directors: [],
      writers: [],
      remark: "",
      releaseDate: res.PremiereDate,
      total: res.ChildCount,
      region: "",
      language: res.OfficialRating || "",
      duration: "",
      content: "",
      chapters: [
        {
          id: encodeURIComponent(this.props.title),
          name: this.props.title,
          items: info.MediaSources.map((s) => ({
            name: res.Name,
            url: `${this.props.props.url}/emby/webs/${webId}/original.mp4?DeviceId=${APP_ID}&MediaSourceId=${s.Id}&PlaySessionId=${info.PlaySessionId}&api_key=${profile.AccessToken}`,
          })),
        },
      ],
      recommends: this.embyItemsToItem(1, rec).data,
    };
  }

  private embyItemsToItem(page: number, res: EmbyItems): WebCommonResult {
    return {
      page,
      limit: 20,
      total: res.TotalRecordCount,
      data: res.Items.filter(
        (e) => e.MediaType === "Web" || e.Type === "Series"
      ).map(
        (e) =>
          ({
            id: e.Id,
            type: e.Type,
            cover: `${this.props.props.url}/emby/Items/${e.Id}/Images/Primary?maxHeight=450&maxWidth=300&tag=${e.ImageTags.Primary}&quality=90`,
            title: e.Name,
            subtitle: "",
            types: [],
            actors: [],
            directors: [],
            writers: [],
            remark: "",
            releaseDate: "",
            total: 0,
            region: "",
            language: "",
            releaseYear: e.ProductionYear + "",
            duration: "",
            content: "",
            chapters: [],
          } as WebListItem)
      ),
    };
  }

  async getWebs(categoryId: string, page: number): Promise<WebCategoryResult> {
    let profile = await this.getProfile();
    const res = await this.request<EmbyItems>(
      `/emby/Users/${profile.User.Id}/Items`,
      {
        IncludeItemTypes: "Movie,Series",
        Fields:
          "BasicSyncInfo,CanDelete,CanDownload,PrimaryImageAspectRatio,ProductionYear,Status,EndDate",
        StartIndex: (page - 1) * 20,
        SortBy: "SortName",
        SortOrder: "Ascending",
        ParentId: categoryId,
        EnableImageTypes: "Primary,Backdrop,Thumb",
        ImageTypeLimit: 1,
        Recursive: true,
        Limit: 20,
      }
    );

    return {
      ...this.embyItemsToItem(page, res),
    };
  }

  async home(page: number): Promise<WebHome> {
    // 获取推荐
    let profile = await this.getProfile();
    const [res, view] = await Promise.all([
      this.request<EmbyResume>(`/emby/Users/${profile.User.Id}/Items/Resume`, {
        Recursive: "true",
        Fields:
          "BasicSyncInfo,CanDelete,CanDownload,PrimaryImageAspectRatio,ProductionYear",
        ImageTypeLimit: "1",
        EnableImageTypes: "Primary,Backdrop,Thumb",
        MediaTypes: "Web",
        Limit: "20",
      }),
      this.request<EmbyView>(`/emby/Users/${profile.User.Id}/Views`, {}),
    ]);
    return {
      page,
      limit: 20,
      total: res.TotalRecordCount,
      categories: view.Items.map((e) => ({
        id: e.Id,
        cover: e.ImageTags.Primary
          ? `http://10.20.30.2:8096/emby/Items/${e.Id}/Images/Primary?maxHeight=212&maxWidth=375&tag=${e.ImageTags.Primary}&quality=90`
          : "",
        name: e.Name,
        children: [],
      })),
      recommends: res.Items.map(
        (e) =>
          ({
            id: e.Id,
            title: e.Name,
            titleEn: "",
            cover: `${this.props.props.url}/emby/Items/${e.Id}/Images/Primary?maxHeight=450&maxWidth=300&tag=${e.ImageTags.Primary}&quality=90`,
            category: {
              id: "",
              children: [],
              cover: "",
              name: "",
            },
            playFrom: "Emby",
            time: e.ProductionYear + "",
          } as WebRecommend)
      ),
    };
  }

  async searchWebs(keyword: string, page: number): Promise<WebSearchResult> {
    let profile = await this.getProfile();
    const res = await this.request<EmbyItems>(
      `/emby/Users/${profile.User.Id}/Items`,
      {
        Fields:
          "BasicSyncInfo,CanDelete,CanDownload,PrimaryImageAspectRatio,ProductionYear,Status,EndDate",
        StartIndex: (page - 1) * 20,
        SortBy: "SortName",
        SortOrder: "Ascending",
        EnableImageTypes: "Primary,Backdrop,Thumb",
        ImageTypeLimit: 1,
        Recursive: "true",
        SearchTerm: keyword,
        GroupProgramsBySeries: "true",
        Limit: 20,
      }
    );
    return {
      ...this.embyItemsToItem(page, res),
    };
  }
}
