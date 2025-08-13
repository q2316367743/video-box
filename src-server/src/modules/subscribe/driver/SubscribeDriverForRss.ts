import Parser from 'rss-parser';
import {
  SourceSubscribe,
  SourceSubscribeDisplay, SourceSubscribeMediaCore, SourceSubscribeRecordResult,
  SourceSubscribeRule
} from "@/types/SourceSubscribe";
import {AbsSubscribePluginHttp} from "@/modules/subscribe/abs/AbsSubscribePluginHttp";
import {parseMedia} from "@/utils/http/HtmlUtil";
import {load} from "cheerio";

export class SubscribeDriverForRss extends AbsSubscribePluginHttp {
  private readonly subscribe: SourceSubscribe;
  private readonly parser = new Parser();

  public readonly display: SourceSubscribeDisplay = 1;
  public readonly supportContent: boolean = true;

  constructor(subscribe: SourceSubscribe, rule: SourceSubscribeRule) {
    super(subscribe.id, rule);
    this.subscribe = subscribe;
  }

  async getSubscribeList(): Promise<Array<SourceSubscribeRecordResult>> {
    const {item_content} = this.rule;
    const rss = await this.parser.parseURL(this.subscribe.url);
    const views = new Array<SourceSubscribeRecordResult>();
    for (let item of rss.items) {
      const {title = '', pubDate = '', link = ''} = item;
      if (!link) continue;
      let description: string;
      let media: Array<SourceSubscribeMediaCore>;
      let content: string;

      if (item_content) {
        // 存在内容规则，那么描述就是描述
        let data = await this.request(link);

        const html = load(data)(item_content).html() || data;

        const htmlParse = parseMedia(html);
        description = item['content:encoded'] || '';
        media = htmlParse.mediaList;
        content = html;
      } else {
        // 不存在内容规则，那么描述就是内容
        const desc = item['content:encoded'] || '';
        const {mediaList, html} = parseMedia(desc);
        description = html;
        media = mediaList;
        content = desc;
      }
      views.push({
        title,
        description,
        link,
        media,
        content,
        pub_date: pubDate ? new Date(pubDate).getTime() : 0,
      });

    }

    return views;
  }

}