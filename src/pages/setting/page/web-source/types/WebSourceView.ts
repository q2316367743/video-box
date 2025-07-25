import {SourceWeb} from "@/views/SourceWeb.js";
import {Folder} from "@/views/Folder.js";
import {group} from "@/utils/lang/ArrayUtil.js";

export interface WebSourceFileView {
  // ID
  id: string;
  // 名称
  name: string;
  // 封面
  cover: string;
  // 是不是文件夹
  folder: false;
  // 排序
  order: number;
  payload: SourceWeb;
}

export interface WebSourceFolderView {
  // ID
  id: string;
  // 名称
  name: string;
  // 封面
  cover: string;
  // 是不是文件夹
  folder: true;
  // 排序
  order: number;
  // 附加数据
  payload: Folder;
  // 子项
  children: Array<WebSourceFileView>;
}

export type WebSourceView = WebSourceFileView | WebSourceFolderView;

export function renderWebSourceView(folders: Array<Folder>, sources: Array<SourceWeb>): Array<WebSourceView> {
  const sourceMap = group(sources, 'folder');
  const views = new Array<WebSourceView>();
  folders.forEach(folder => {
    views.push({
      id: folder.id,
      name: folder.name,
      cover: "",
      folder: true,
      order: folder.order,
      payload: folder,
      children: sourceMap.getOrDefault(folder.id, [])
        .sort((a, b) => a.order - b.order)
        .map(source => ({
          id: source.id,
          name: source.title,
          cover: source.favicon,
          folder: false,
          order: source.order,
          payload: source
        }))
    });
    sourceMap.delete(folder.id);
  });
  sourceMap.values().flatMap(e => e).forEach(source => {
    views.push({
      id: source.id,
      name: source.title,
      cover: source.favicon,
      folder: false,
      order: source.order,
      payload: source
    });
  });
  views.sort((a, b) => a.order - b.order);
  return views;
}