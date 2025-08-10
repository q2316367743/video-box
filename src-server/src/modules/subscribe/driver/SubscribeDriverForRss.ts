import Parser from 'rss-parser';
import {SubscribeDriver} from "@/modules/subscribe/SubscribeDriver";
import {
  SourceSubscribe,
  SourceSubscribeContent, SourceSubscribeList,
  SourceSubscribeRule
} from "@/types/SourceSubscribe";
import {http} from "@/global/http";

export class SubscribeDriverForRss implements SubscribeDriver {
  private readonly subscribe: SourceSubscribe;
  private readonly rule: SourceSubscribeRule;
  private readonly parser = new Parser();

  constructor(subscribe: SourceSubscribe, rule: SourceSubscribeRule) {
    this.subscribe = subscribe;
    this.rule = rule;
  }

  async getSubscribeList(): Promise<Array<SourceSubscribeList>> {
    const items = await this.parser.parseURL(this.subscribe.url);
    return items.items.map(e => {
      const {title = '', pubDate = '', description = '', link = ''} = e;
      return {
        title: title,
        description: description,
        pub_date: pubDate ? new Date(pubDate).getTime() : 0,
        media: e.media,
        link: link,
      }
    }).filter(e => !!e.link)
  }

  async getSubscribeContent(link: string): Promise<SourceSubscribeContent> {
    const {data} = await http.get<string>(link, {responseType: 'text'});
    const content = html2md(data);

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