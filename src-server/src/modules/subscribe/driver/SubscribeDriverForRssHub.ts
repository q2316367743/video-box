import Parser from 'rss-parser';
import {
  SourceSubscribe,
   SourceSubscribeDisplay,  SourceSubscribeRecordResult,
  SourceSubscribeRule
} from "@/types/SourceSubscribe";
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

  async getSubscribeList(): Promise<Array<SourceSubscribeRecordResult>> {

    // 此处查询全部的rss hub 实例
    const instances = await sourceSubscribeRssHubDao.query()
      .eq('is_enabled', 1).list();
    const instance = draw(instances);
    if (!instance) return Promise.reject(new Error("rss hub 实例不存在"));

    const link = this.subscribe.url.replace('rsshub://', instance.url);


    const rss = await this.parser.parseURL(link);
    const views = new Array<SourceSubscribeRecordResult>();
    for (let item of rss.items) {
      const {title = '', pubDate = '', link = ''} = item;
      if (!link) continue;
      // 不存在内容规则，那么描述就是内容
      const desc = item['content:encoded'] || '';
      const {mediaList, html} = parseMedia(desc);
      const media = mediaList;
      const content = desc;
      const description = html;
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