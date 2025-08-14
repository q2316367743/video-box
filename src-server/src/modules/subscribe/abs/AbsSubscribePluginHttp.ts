import {
  SourceSubscribeDisplay,
  SourceSubscribeRecordResult,
  SourceSubscribeRule
} from "@/types/SourceSubscribe";
import {http} from "@/global/http";
import {parseArrayBuffer} from "@/utils/file/CharsetUtil";
import {AbsSubscribePluginStore} from "@/modules/subscribe/abs/AbsSubscribePluginStore";
import {sourceSubscribeRecordDao} from "@/dao";
import {debug} from "@rasla/logify";

export abstract class AbsSubscribePluginHttp extends AbsSubscribePluginStore {

  protected readonly rule: SourceSubscribeRule;

  protected constructor(id: string, rule: SourceSubscribeRule) {
    super(id);
    this.rule = rule;
  }

  protected async request(link: string): Promise<string> {
    const {item_charset} = this.rule;

    const {data} = await http.get<ArrayBuffer>(link, {responseType: 'arraybuffer'});

    // 此处要解码
    let html: string;
    if (item_charset) {
      html = parseArrayBuffer(data, item_charset);
    } else {
      html = parseArrayBuffer(data, 'utf-8');
    }

    return html;
  }

  protected async exist(link: string, pubDate: number): Promise<boolean> {
    const t = await sourceSubscribeRecordDao.query()
      .eq('subscribe_id', this.id)
      .eq('link', link)
      .eq('pub_date', pubDate)
      .count();
    debug(`链接「${link}」存在「${t}」条`)
    return t > 0;
  }

  abstract display: SourceSubscribeDisplay;
  abstract supportContent: boolean;

  abstract getSubscribeList(): Promise<Array<SourceSubscribeRecordResult>>;

}