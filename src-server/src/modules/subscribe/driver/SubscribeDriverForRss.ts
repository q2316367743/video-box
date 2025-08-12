import Parser from 'rss-parser';
import {
  SourceSubscribe,
  SourceSubscribeContentCore, SourceSubscribeDisplay, SourceSubscribeMediaCore, SourceSubscribeRecordView,
  SourceSubscribeRule
} from "@/types/SourceSubscribe";
import {load} from "cheerio";
import {AbsSubscribePluginHttp} from "@/modules/subscribe/abs/AbsSubscribePluginHttp";
import {parseMedia} from "@/utils/http/HtmlUtil";

export class SubscribeDriverForRss extends AbsSubscribePluginHttp {
  private readonly subscribe: SourceSubscribe;
  private readonly parser = new Parser();

  public readonly display: SourceSubscribeDisplay = 1;
  public readonly supportContent: boolean = true;

  constructor(subscribe: SourceSubscribe, rule: SourceSubscribeRule) {
    super(subscribe.id, rule);
    this.subscribe = subscribe;
  }

  async getSubscribeList(): Promise<Array<SourceSubscribeRecordView>> {
    const items = await this.parser.parseURL(this.subscribe.url);
    return items.items.map(e => {
      const {title = '', pubDate = '', link = ''} = e;
      const {mediaList, html} = parseMedia(e['content:encoded'] || '');
      return {
        title: title,
        description: html,
        pub_date: pubDate ? new Date(pubDate).getTime() : 0,
        link: link,
        media: mediaList
      }
    }).filter(e => !!e.link)
  }

  async getSubscribeContent(link: string): Promise<SourceSubscribeContentCore> {
    const {item_content} = this.rule;

    // 此处要解码
    let html = await this.request(link);
    if (item_content) {
      html = load(html)(item_content).text()
    }


    const content = html2md(html);

    return Promise.resolve({
      link,
      content,
      subscribe_id: this.subscribe.id,
      id: link,
      ai: '',
      created_at: Date.now(),
      updated_at: Date.now(),
    });
  }


}