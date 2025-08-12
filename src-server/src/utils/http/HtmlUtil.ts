import {load} from 'cheerio';
import {SourceSubscribeMediaCore} from "@/types/SourceSubscribe";

interface ParseResult {
  html: string;          // 删除媒体元素后的 HTML
  mediaList: SourceSubscribeMediaCore[];   // 所有图片 / 视频 / 音频 地址
}

export function parseMedia(rawHtml: string): ParseResult {
  const $ = load(rawHtml); // 保留原始实体

  const mediaList: SourceSubscribeMediaCore[] = [];

  /* ---------- 1. 收集并删除 <img> ---------- */
  $('img').each((_, el) => {
    const $el = $(el);
    const src = $el.attr('src');
    if (src) mediaList.push({
      url: src,
      type: 1,
      alt: $el.attr('alt') || '',
      order: mediaList.length + 1
    });

    const poster = $el.attr('poster');
    if (poster) mediaList.push({
      url: poster,
      type: 1,
      alt: $el.attr('alt') || '',
      order: mediaList.length + 1
    });

    // 直接在同一次遍历里删掉
    $el.remove();
  });

  /* ---------- 2. <video> ---------- */
  $('video').each((_, el) => {
    const $el = $(el);
    const src = $el.attr('src');
    if (src) mediaList.push({
      url: src,
      type: 2,
      alt: '',
      order: mediaList.length + 1
    });

    const poster = $el.attr('poster');
    if (poster) mediaList.push({
      url: poster,
      type: 1,
      alt: '',
      order: mediaList.length + 1
    });

    $el.find('source').each((_, s) => {
      const sSrc = $(s).attr('src');
      if (sSrc) mediaList.push({
        url: sSrc,
        type: 2,
        alt: '',
        order: mediaList.length + 1
      });
    });

    $el.remove();
  });

  /* ---------- 3. <audio> ---------- */
  $('audio').each((_, el) => {
    const $el = $(el);
    const src = $el.attr('src');
    if (src) mediaList.push({
      url: src,
      type: 3,
      alt: '',
      order: mediaList.length + 1
    });

    $el.find('source').each((_, s) => {
      const sSrc = $(s).attr('src');
      if (sSrc) mediaList.push({
        url: sSrc,
        type: 3,
        alt: '',
        order: mediaList.length + 1
      });
    });

    $el.remove();
  });

  return {
    html: $.html(),      // cheerio 默认会补齐闭合标签，如需完全原样可再处理
    mediaList
  };
}
