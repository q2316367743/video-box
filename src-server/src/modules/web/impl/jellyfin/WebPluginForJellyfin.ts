import { AbsWebPluginForStore } from "@/modules/web/abs/AbsWebPluginForStore";
import { SourceWeb } from "@/types/SourceWeb";
import {
  WebCategoryResult,
  WebDetail,
  WebHome,
  WebListItem,
  WebSearchResult,
} from "@/modules/web/WebPlugin";
import { AxiosRequestConfig } from "axios";
import { useRequest } from "@/global/http";
import { APP_ID, APP_NAME, APP_VERSION } from "@/global/constant";

export interface WebPluginForJellyfinProps {
  url: string;
  username: string;
  password: string;
}

export class WebPluginForJellyfin extends AbsWebPluginForStore {
  public props: SourceWeb;

  constructor(props: SourceWeb) {
    super(props.id);
    this.props = props;
  }

  private async request<T>(config: AxiosRequestConfig) {
    const token = this.getItem("token");
    const { data } = await useRequest("", {
      ...config,
      params: {
        ...config.params,
        "X-Emby-Client": APP_ID,
        "X-Emby-Device-Name": APP_NAME,
        "X-Emby-Device-Id": APP_ID,
        "X-Emby-Client-Version": APP_VERSION,
        "X-Emby-Language": "zh-cn",
      },
    });
  }

  getDetail(video: WebListItem | string): Promise<WebDetail> {
    return Promise.resolve({} as WebDetail);
  }

  getWebs(categoryId: string, page: number): Promise<WebCategoryResult> {
    return Promise.resolve({} as WebCategoryResult);
  }

  home(page: number): Promise<WebHome> {
    return Promise.resolve({} as WebHome);
  }

  searchWebs(keyword: string, page: number): Promise<WebSearchResult> {
    return Promise.resolve({} as WebSearchResult);
  }
}
