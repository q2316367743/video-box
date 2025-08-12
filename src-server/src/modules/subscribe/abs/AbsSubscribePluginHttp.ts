import {
  SourceSubscribeContentCore,
  SourceSubscribeDisplay,
  SourceSubscribeRecordView,
  SourceSubscribeRule
} from "@/types/SourceSubscribe";
import {http} from "@/global/http";
import {parseArrayBuffer} from "@/utils/file/CharsetUtil";
import {AbsSubscribePluginStore} from "@/modules/subscribe/abs/AbsSubscribePluginStore";

export abstract class AbsSubscribePluginHttp extends AbsSubscribePluginStore {

  protected readonly rule: SourceSubscribeRule;

  constructor(id: string, rule: SourceSubscribeRule) {
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

  abstract display: SourceSubscribeDisplay;
  abstract supportContent: boolean;

  abstract getSubscribeContent(link: string): Promise<SourceSubscribeContentCore>;

  abstract getSubscribeList(): Promise<Array<SourceSubscribeRecordView>>;

}