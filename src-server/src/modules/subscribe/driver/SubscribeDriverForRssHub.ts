import Parser from 'rss-parser';
import {
  SourceSubscribe,
  SourceSubscribeDisplay, SourceSubscribeRecordResult,
  SourceSubscribeRule
} from "@/types/SourceSubscribe";
import {AbsSubscribePluginHttp} from "@/modules/subscribe/abs/AbsSubscribePluginHttp";
import {sourceSubscribeRssHubDao} from "@/dao";
import {draw} from "radash";
import {parseMedia} from "@/utils/http/HtmlUtil";
import {debug} from "@rasla/logify";
import {load} from "cheerio";
import dayjs from "dayjs";

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
    const xml = await this.request(link);
    const rss = await this.parser.parseString(xml);
    let views = new Array<SourceSubscribeRecordResult>();
    for (let item of rss.items) {
      const {title = '', pubDate = '', link = ''} = item;

      const pub_date = pubDate ? dayjs(pubDate).toDate().getTime() : 0;
      if (!link) continue;

      if (await this.exist(link, pub_date)) continue;
      const description = item['content:encoded'] || '';
      views.push({
        title,
        description,
        link,
        media: [],
        content: '',
        pub_date,
      });

    }
    views = views
      // 存在发布时间的
      .filter(e => e.pub_date > 0)
      .sort((a, b) => a.pub_date - b.pub_date)
      // 只处理最近的 50 条
      .slice(-50);

    for (let view of views) {

      if (item_content) {
        // 存在内容规则，那么描述就是描述
        let data = await this.request(view.link);

        const html = load(data)(item_content).html() || data;

        const htmlParse = parseMedia(html);
        const descParse = parseMedia(view.description);
        view.media = htmlParse.mediaList;
        view.content = html;
        view.description = descParse.html;
      } else {
        // 不存在内容规则，那么描述就是内容
        const descParse = parseMedia(view.description);
        view.content = view.description;
        view.media = descParse.mediaList;
        view.description = descParse.html;
      }
    }

    return views;

  }


}