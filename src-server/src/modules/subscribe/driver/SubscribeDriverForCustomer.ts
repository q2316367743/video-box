import {
  SourceSubscribe,
  SourceSubscribeContentCore, SourceSubscribeDisplay,
  SourceSubscribeRecordView,
  SourceSubscribeRule
} from "@/types/SourceSubscribe";
import {load} from 'cheerio';
import dayjs from "dayjs";
import {AbsSubscribePluginHttp} from "@/modules/subscribe/abs/AbsSubscribePluginHttp";

export class SubscribeDriverForCustomer extends AbsSubscribePluginHttp {

  private readonly subscribe: SourceSubscribe;

  public readonly display: SourceSubscribeDisplay = 1;
  public readonly supportContent: boolean = true;

  constructor(subscribe: SourceSubscribe, rule: SourceSubscribeRule) {
    super(subscribe.id, rule);
    this.subscribe = subscribe;
  }

  async getSubscribeContent(link: string): Promise<SourceSubscribeContentCore> {
    const {item_content} = this.rule;
    // 此处要解码
    let html = await this.request(link);
    const $ = load(html);
    const body = $(item_content).text();
    const content = html2md(body);

    return Promise.resolve({link, content});
  }

  async getSubscribeList(): Promise<Array<SourceSubscribeRecordView>> {
    const {list, item_title, item_description, item_pub_date, item_link, item_media} = this.rule;

    const results = new Array<SourceSubscribeRecordView>();

    // 此处要解码
    let html = await this.request(this.subscribe.url);

    const $ = load(html);
    const items = $(list);

    for (let item of items) {
      const $item = load(item);
      const pubDate = $item(item_pub_date).text();
      const link = $item(item_link).attr('href');
      if (!link) continue;
      results.push({
        title: $item(item_title).text(),
        description: $item(item_description).text(),
        pub_date: pubDate ? dayjs(pubDate).toDate().getTime() : 0,
        link,
        media: []
      })
    }

    return results;
  }

}
