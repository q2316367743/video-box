import {ParserEngine} from "@/algorithm/ParserEngine/types";
import {
  parseConnectorElementsToElements, parseConnectorElementsToString,
  parseRegexToStrings,
} from "@/algorithm/ParserEngine/util";
import {ParserEngineProxy} from "@/algorithm/ParserEngine/ParserEngineProxy";
import type {CheerioAPI} from "cheerio";
import {load} from "cheerio";

export class DomParseEngine implements ParserEngine {

  private readonly dom: CheerioAPI;

  constructor(html: string | CheerioAPI) {
    if (typeof html === 'string') {
      this.dom = load(html);
    } else {
      this.dom = html;
    }
  }

  private _parseToString(select: string): string {
    if (/^@XPath:/i.test(select)) {
      throw new Error("XPath暂不可用");
    } else {
      return parseConnectorElementsToString(select, [this.dom]);
    }
  }

  private _parseToEngines(select: string): Array<ParserEngine> {
    // 反转规则
    let reversal = false;
    if (select.startsWith("-")) {
      reversal = true;
      select = select.substring(1);
    }

    const engines = new Array<ParserEngine>();


    if (select.startsWith("@js:")) {
      // TODO: JS代码
      throw new Error("JS暂不可用")
    } else if (/^@Xpath:/i.test(select)) {
      throw new Error("XPath暂不可用");
    } else {
      parseConnectorElementsToElements(select, [this.dom])
        .forEach(element => engines.push(new ParserEngineProxy(new DomParseEngine(element))));

    }

    if (reversal) {
      engines.reverse();
    }

    return engines;
  }

  parseToString(select: string): string {
    if (!select) {
      // 没有选择器
      return '';
    }
    try {
      return this._parseToString(select);
    } catch (e) {
      console.error(`字符|解析规则【${select}】出错`, e);
      return '';
    }
  }

  parseToEngines(select: string): Array<ParserEngine> {
    if (!select) {
      // 没有选择器
      return [];
    }
    try {
      return this._parseToEngines(select);
    } catch (e) {
      console.error(`引擎|解析规则【${select}】出错`, e);
      return [];
    }
  }

  /**
   * 解析正则规则
   * @param regex 正则表达式
   * @param selects 每一项选择器：$1、$2...
   */
  parseRegexToStrings(regex: string, selects: Array<string | undefined>): Array<Array<string>> {
    return parseRegexToStrings(regex, selects, this.dom.html())
  }

  toString(): string {
    return this.dom.text();
  }

  toHTML(): string {
    return this.dom.html();
  }

  toInnerHTML(): string {
    return this.dom.html();
  }

}

