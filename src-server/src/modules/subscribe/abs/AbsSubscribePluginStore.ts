import {LocalNameEnum} from "@/global/LocalNameEnum";
import {storage} from "@/global/db";
import {SubscribeDriver} from "@/modules/subscribe/SubscribeDriver";
import {
  SourceSubscribeContentCore,
  SourceSubscribeDisplay,
  SourceSubscribeRecordView
} from "@/types/SourceSubscribe";

export abstract class AbsSubscribePluginStore implements SubscribeDriver {
  private readonly id: string;
  private readonly prefix: string;

  protected constructor(id: string) {
    this.id = id;
    this.prefix = `${LocalNameEnum.STORE_SOURCE_SUBSCRIBE}/${id}/`;
  }

  public getItem<T extends Record<string, any> | string | number | boolean>(
    key: string
  ): Promise<T | null> {
    return storage.getItem<T>(this.prefix + key);
  }

  public async setItem<
    T extends Record<string, any> | string | number | boolean
  >(key: string, value: T) {
    await storage.setItem(this.prefix + key, value);
  }

  public async removeItem(key: string) {
    await storage.removeItem(this.prefix + key);
  }

  abstract display: SourceSubscribeDisplay;
  abstract supportContent: boolean;

  abstract getSubscribeContent(link: string): Promise<SourceSubscribeContentCore>;

  abstract getSubscribeList(): Promise<Array<SourceSubscribeRecordView>>;

}
