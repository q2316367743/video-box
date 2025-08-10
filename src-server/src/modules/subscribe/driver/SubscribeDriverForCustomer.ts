import {SubscribeDriver} from "@/modules/subscribe/SubscribeDriver";
import {
  SourceSubscribe,
  SourceSubscribeContentCore,
  SourceSubscribeList,
  SourceSubscribeRule
} from "@/types/SourceSubscribe";
import {http} from "@/global/http";
import {load} from 'cheerio';
import dayjs from "dayjs";
import {parseArrayBuffer} from "@/utils/file/CharsetUtil";

export class SubscribeDriverForCustomer implements SubscribeDriver {

  private readonly subscribe: SourceSubscribe;
  private readonly rule: SourceSubscribeRule;

  constructor(subscribe: SourceSubscribe, rule: SourceSubscribeRule) {
    this.subscribe = subscribe;
    this.rule = rule;
  }

  async getSubscribeContent(link: string): Promise<SourceSubscribeContentCore> {
    const {item_content, item_charset} = this.rule;

    const {data} = await http.get<ArrayBuffer>(link, {responseType: 'arraybuffer'});
    // 此处要解码
    let html: string;
    if (item_charset) {
      html = parseArrayBuffer(data, item_charset);
    } else {
      html = parseArrayBuffer(data, 'utf-8');
    }
    const $ = load(html);
    const body = $(item_content).text();
    const content = html2md(body);

    return Promise.resolve({link, content});
  }

  async getSubscribeList(): Promise<Array<SourceSubscribeList>> {
    const {list, item_title, item_description, item_pub_date, item_link, item_media, item_charset} = this.rule;

    const results = new Array<SourceSubscribeList>();

    const {data} = await http.get<ArrayBuffer>(this.subscribe.url, {responseType: 'arraybuffer'});

    // 此处要解码
    let html: string;
    if (item_charset) {
      html = parseArrayBuffer(data, item_charset);
    } else {
      html = parseArrayBuffer(data, 'utf-8');
    }


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
        media: $item(item_media).text(),
      })
    }

    return results;
  }

}
