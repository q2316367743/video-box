import { SourceWeb } from "@/types/SourceWeb";
import {
  WebCategoryResult,
  WebDetail,
  WebHome,
  WebListItem,
  WebPlugin,
  WebSearchResult,
} from "../WebPlugin";
import { LocalNameEnum } from "@/global/LocalNameEnum";
import { storage } from "@/global/db";

export abstract class AbsWebPluginForStore implements WebPlugin {
  abstract props: SourceWeb;

  abstract getDetail(video: WebListItem | string): Promise<WebDetail>;

  abstract getWebs(
    categoryId: string,
    page: number
  ): Promise<WebCategoryResult>;

  abstract home(page: number): Promise<WebHome>;

  abstract searchWebs(keyword: string, page: number): Promise<WebSearchResult>;

  protected readonly id: string;
  private readonly prefix: string;

  protected constructor(id: string) {
    this.id = id;
    this.prefix = `${LocalNameEnum.STORE_SOURCE_WEB}/${this.id}/`;
  }

  protected getItem<T extends Record<string, any> | string | number | boolean>(
    key: string
  ): Promise<T | null> {
    return storage.getItem<T>(this.prefix + key);
  }

  protected async setItem<
    T extends Record<string, any> | string | number | boolean
  >(key: string, value: T) {
    await storage.setItem(this.prefix + key, value);
  }

  protected async removeItem(key: string) {
    await storage.removeItem(this.prefix + key);
  }
}
