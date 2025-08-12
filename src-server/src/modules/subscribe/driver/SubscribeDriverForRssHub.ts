import Parser from 'rss-parser';
import {
  SourceSubscribe,
  SourceSubscribeContentCore, SourceSubscribeDisplay, SourceSubscribeRecordView,
  SourceSubscribeRule
} from "@/types/SourceSubscribe";
import {load} from "cheerio";
import {AbsSubscribePluginHttp} from "@/modules/subscribe/abs/AbsSubscribePluginHttp";
import {sourceSubscribeRssHubDao} from "@/dao";
import {draw} from "radash";
import {parseMedia} from "@/utils/http/HtmlUtil";

export class SubscribeDriverForRssHub extends AbsSubscribePluginHttp {
  private readonly subscribe: SourceSubscribe;
  private readonly parser = new Parser();

  public readonly display: SourceSubscribeDisplay = 1;
  public readonly supportContent: boolean = true;

  constructor(subscribe: SourceSubscribe, rule: SourceSubscribeRule) {
    super(subscribe.id, rule);
    this.subscribe = subscribe;
  }

  async getSubscribeList(): Promise<Array<SourceSubscribeRecordView>> {

    // 此处查询全部的rss hub 实例
    const instances = await sourceSubscribeRssHubDao.query()
      .eq('is_enabled', 1).list();
    const instance = draw(instances);
    if (!instance) return Promise.reject(new Error("rss hub 实例不存在"));

    const link = this.subscribe.url.replace('rsshub://', instance.url);

    const items = await this.parser.parseURL(link);
    return items.items.map(e => {
      const {title = '', pubDate = '', description = '', link = ''} = e;
      const {mediaList, html} = parseMedia(description);
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
    });
  }


}