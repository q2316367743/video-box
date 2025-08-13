// 解析策略
import {CheerioAPI, load} from "cheerio";

export interface ParseStrategy {
  sign: string;

  handler(select: string, elements: Array<CheerioAPI>): Array<CheerioAPI>;
}

// 默认解析策略
const DefaultParseStrategy: ParseStrategy = {
  sign: '',
  handler(select: string, elements: Array<CheerioAPI>): Array<CheerioAPI> {
    // ID选择器
    const results = new Array<CheerioAPI>();
    for (let element of elements) {
      let elementNodeListOf = element(select);
      for (let i = 0; i < elementNodeListOf.length; i++) {
        const el = elementNodeListOf[i];
        if (el) results.push(load(el));
      }
    }
    return results;
  }
}

// 自身解析策略
const SelfParseStrategy: ParseStrategy = {
  sign: 'self',
  handler(_select: string, elements: Array<CheerioAPI>): Array<CheerioAPI> {
    return elements;
  }
}

// 标签解析策略
const TagParseStrategy: ParseStrategy = {
  sign: 'tag.',
  handler(select: string, elements: Array<CheerioAPI>): Array<CheerioAPI> {
    // 标签选择器
    const results = new Array<CheerioAPI>();
    const tag = select.substring(4);
    for (let element of elements) {
      const elementsByTagName = element(tag);
      for (let i = 0; i < elementsByTagName.length; i++) {
        const el = elementsByTagName[i];
        if (el) results.push(load(el));
      }
    }
    return results;
  }
}

// 类解析策略
const ClassParseStrategy: ParseStrategy = {
  sign: 'class.',
  handler(select: string, elements: Array<CheerioAPI>): Array<CheerioAPI> {
    // 类选择器
    const results = new Array<CheerioAPI>();
    const tag = select.substring(5);
    for (let element of elements) {
      const elementsByTagName = element(tag);
      for (let i = 0; i < elementsByTagName.length; i++) {
        const el = elementsByTagName[i];
        if (el) results.push(load(el));
      }
    }
    return results;
  }
}

// ID解析策略
const IdParseStrategy: ParseStrategy = {
  sign: 'id.',
  handler(select: string, elements: Array<CheerioAPI>): Array<CheerioAPI> {
    const results = new Array<CheerioAPI>();
    const tag = select.substring(3);
    for (let element of elements) {
      const elementsByTagName = element(`#${tag}`);
      for (let i = 0; i < elementsByTagName.length; i++) {
        const el = elementsByTagName[i];
        if (el) results.push(load(el));
      }
    }
    return results;
  }
}


// 子元素解析策略
const ChildrenParseStrategy: ParseStrategy = {
  sign: 'children',
  handler(_select: string, elements: Array<CheerioAPI>): Array<CheerioAPI> {
    const results = new Array<CheerioAPI>();
    for (let element of elements) {
      for (const el of element("*").children()) {
        results.push(load(el));
      }
    }
    return results;
  }
}


const strategies = [TagParseStrategy, ClassParseStrategy, IdParseStrategy,
  ChildrenParseStrategy, SelfParseStrategy];

/**
 * 获取一个解析策略
 * @param select 选择器
 */
export function getParseStrategy(select: string): ParseStrategy {
  if (select === '') {
    // 如果是空选择器，就是子节点解析策略
    return ChildrenParseStrategy;
  }
  for (let strategy of strategies) {
    if (select.startsWith(strategy.sign)) {
      return strategy
    }
  }
  // 默认解析策略
  return DefaultParseStrategy;
}
