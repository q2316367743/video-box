import {
  SourceSubscribe,
  SourceSubscribeContentCore, SourceSubscribeDisplay,
  SourceSubscribeRecordResult,
  SourceSubscribeRule
} from "@/types/SourceSubscribe";
import dayjs from "dayjs";
import {AbsSubscribePluginHttp} from "@/modules/subscribe/abs/AbsSubscribePluginHttp";
import {parseHtml, parseMedia} from "@/utils/http/HtmlUtil";
import {debug} from "@rasla/logify";
import {load} from "cheerio";

export class SubscribeDriverForCustomer extends AbsSubscribePluginHttp {

  private readonly subscribe: SourceSubscribe;

  public readonly display: SourceSubscribeDisplay = 1;
  public readonly supportContent: boolean = true;

  constructor(subscribe: SourceSubscribe, rule: SourceSubscribeRule) {
    super(subscribe.id, rule);
    this.subscribe = subscribe;
  }

  private async getSubscribeContent(link: string): Promise<SourceSubscribeContentCore> {
    const {item_content} = this.rule;
    // 此处要解码
    debug(`正在从「${link}」中获取内容`)
    let html = await this.request(link);
    // const content = parseHtml(item_content, html);
    // const content = html2md(body);
    const content = load(html)(item_content).html() || html;

    return {link, content};
  }

  async getSubscribeList(): Promise<Array<SourceSubscribeRecordResult>> {
    const {list, item_title, item_description, item_pub_date, item_link} = this.rule;

    let results = new Array<SourceSubscribeRecordResult>();

    // 此处要解码
    let html = await this.request(this.subscribe.url);

    const $ = load(html)
    const items = $(list);

    for (let item of items) {
      const $item = load(item);
      const pubDate = parseHtml(item_pub_date, $item);
      const link = parseHtml(item_link, $item);
      if (!link) continue;
      const url = new URL(link, this.subscribe.url).toString();
      results.push({
        title: parseHtml(item_title, $item),
        description: parseHtml(item_description, $item),
        pub_date: pubDate ? dayjs(pubDate).toDate().getTime() : 0,
        link: url,
        media: [],
        content: ''
      });
    }
    results = results
      // 存在发布时间的
      .filter(e => e.pub_date > 0)
      .sort((a, b) => a.pub_date - b.pub_date)
      // 只处理最近的 50 条
      .slice(-50);
    for (let result of results) {
      const c = await this.getSubscribeContent(result.link);
      const {mediaList} = parseMedia(c.content);
      result.media = mediaList;
      result.content = c.content;
      // 睡眠100ms
      await Bun.sleep(100);
    }

    return results;
  }

}
