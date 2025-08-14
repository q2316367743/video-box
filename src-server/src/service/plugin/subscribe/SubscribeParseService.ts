import Parser from 'rss-parser';
import {SourceSubscribeCore, SourceSubscribeList, SourceSubscribePostParam} from "@/types/SourceSubscribe";
import {http} from "@/global/http";
import {parseArrayBuffer} from "@/utils/file/CharsetUtil";

export interface SubscribeRssParseResult extends SourceSubscribeCore {
  records: Array<SourceSubscribeList>
}

async function request(link: string, charset: string): Promise<string> {

  const {data} = await http.get<ArrayBuffer>(link, {responseType: 'arraybuffer'});

  // 此处要解码
  let html: string;
  if (charset) {
    html = parseArrayBuffer(data, charset);
  } else {
    html = parseArrayBuffer(data, 'utf-8');
  }

  return html;
}

export async function subscribeParseService(param: SourceSubscribePostParam): Promise<SubscribeRssParseResult> {
  switch (param.type) {
    case 1:
      return subscribeRssParseService(param.url, param.rule.item_charset);
    default:
      return Promise.reject(new Error("订阅类型未知"))
  }
}

export async function subscribeRssParseService(url: string, charset: string): Promise<SubscribeRssParseResult> {
  const xml = await request(url, charset);
  const parser = new Parser();
  const feed = await parser.parseString(xml);
  return {
    name: feed.title || '',
    description: feed.description || '',
    url: url,
    icon: feed.image?.url || '',
    link: feed.link || '',
    records: feed.items.map(e => ({
      title: e.title || '',
      description: e.description || '',
      pub_date: e.pubDate ? new Date(e.pubDate).getTime() : 0,
      link: e.link || '',
    }))
  }

}