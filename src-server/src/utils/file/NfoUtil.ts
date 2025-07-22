import { DiskType } from "@/types/SourceDisk";
import { DiskProgram, DiskProgramActor } from "@/types/SourceDiskEntry";

/**
 * 获取元素文本内容
 * @param element 元素节点
 * @param tagName 标签名
 * @returns 元素文本内容
 */
function getElementText(element: Element, tagName: string): string {
  const node = element.querySelector(tagName);
  return node ? node.textContent || "" : "";
}

/**
 * 获取多个元素文本内容
 * @param element 元素节点
 * @param tagName 标签名
 * @returns 元素文本内容数组
 */
function getElementTexts(element: Element, tagName: string): string[] {
  const nodes = element.querySelectorAll(tagName);
  return Array.from(nodes)
    .map((node) => node.textContent || "")
    .filter((e) => e.trim() !== "");
}

/**
 * 解析nfo文件
 * @param nfo nfo文件内容
 * @param type 类型
 */
export function parseNfo(nfo: string, type: DiskType): DiskProgram {
  const parser = new DOMParser();
  const doc = parser.parseFromString(nfo, "text/xml");

  const root = doc.querySelector(type);
  if (!root) throw new Error("Invalid NFO file");

  return {
    id: getElementText(root, "uniqueid"),
    description: getElementText(root, "plot"),
    title: getElementText(root, "title"),
    originalTitle: getElementText(root, "originaltitle"),
    userRating: parseFloat(getElementText(root, "rating")) || 0,
    plot: getElementText(root, "plot"),
    mpaa: getElementText(root, "mpaa"),
    country: getElementText(root, "country"),
    uniqueId: getElementText(root, "uniqueid"),
    num: getElementText(root, "num"),
    genre: getElementTexts(root, "genre"),
    website: getElementText(root, "website"),
    tag: getElementTexts(root, "tag"),
    set: {
      name: getElementText(root, "set name"),
      overview: getElementText(root, "set overview"),
    },
    maker: getElementText(root, "maker"),
    credits: getElementTexts(root, "credits"),
    directors: getElementTexts(root, "director"),
    studio: getElementText(root, "studio"),
    actors: Array.from(root.querySelectorAll("actor")).map((actorNode) => {
      return {
        name: getElementText(actorNode, "name"),
        role: getElementText(actorNode, "role"),
        type: getElementText(actorNode, "type"),
        order: getElementText(actorNode, "order"),
        thumb: getElementText(actorNode, "thumb"),
      } as DiskProgramActor;
    }),
    premiered: getElementText(root, "premiered"),
    release: getElementText(root, "release"),
    releaseDate: getElementText(root, "releasedate"),
    dateAdded: getElementText(root, "dateadded"),
    year: getElementText(root, "year"),
    poster: getElementText(root, "thumb"),
    thumb: getElementText(root, "thumb"),
    fanart: getElementText(root, "fanart thumb"),
    cover: getElementText(root, "thumb"),
    sessions: [], // NFO 文件通常不直接包含会话和章节信息，这里留空
  };
}
