import Parser from 'rss-parser';
import {
  SourceSubscribe,
  SourceSubscribeDisplay, SourceSubscribeMediaCore, SourceSubscribeRecordResult,
  SourceSubscribeRule
} from "@/types/SourceSubscribe";
import {AbsSubscribePluginHttp} from "@/modules/subscribe/abs/AbsSubscribePluginHttp";
import {sourceSubscribeRssHubDao} from "@/dao";
import {draw} from "radash";
import {parseMedia} from "@/utils/http/HtmlUtil";
import {debug} from "@rasla/logify";
import {buildDomParseEngin} from "@/algorithm/ParserEngine";

export class SubscribeDriverForRssHub extends AbsSubscribePluginHttp {
  private readonly subscribe: SourceSubscribe;
  private readonly parser = new Parser();

  public readonly display: SourceSubscribeDisplay = 1;
  public readonly supportContent: boolean = true;

  constructor(subscribe: SourceSubscribe, rule: SourceSubscribeRule) {
    super(subscribe.id, rule);
    this.subscribe = subscribe;
  }

  async getSubscribeList(): Promise<Array<SourceSubscribeRecordResult>> {

    // 此处查询全部的rss hub 实例
    const instances = await sourceSubscribeRssHubDao.query()
      .eq('is_enabled', 1).list();
    const instance = draw(instances);
    if (!instance) return Promise.reject(new Error("rss hub 实例不存在"));

    const link = this.subscribe.url.replace('rsshub://', instance.url);

    debug(`请求链接：${link}`)

    const {item_content} = this.rule;
    const rss = await this.parser.parseURL(link);
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

        const $ = buildDomParseEngin(data);
        const html = $.parseToString(item_content);

        const htmlParse = parseMedia(html);
        description = item['content:encoded'] || '';
        media = htmlParse.mediaList;
        content = htmlParse.html;
      } else {
        // 不存在内容规则，那么描述就是内容
        const desc = item['content:encoded'] || '';
        const {mediaList, html} = parseMedia(desc);
        media = mediaList;
        content = desc;
        description = html;
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