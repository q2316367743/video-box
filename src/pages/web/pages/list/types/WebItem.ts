import {Folder} from "@/entities/Folder.ts";
import {VideoSourceEntry} from "@/entities/VideoSource.ts";
import {group} from "@/utils/lang/ArrayUtil.ts";

export interface WebItemFile {
  // ID
  id: string;
  // 名称
  name: string;
  // 封面
  cover: string;
  // 类型
  type: 'file';
  // 排序
  order: number;
  source: VideoSourceEntry;
}

export interface WebItemFolder {
  // ID
  id: string;
  // 名称
  name: string;
  // 封面
  cover: string;
  // 类型
  type: 'folder';
  // 排序
  order: number;
  // 子项，只有文件夹类型
  children: WebItemFile[];
  source: Folder;
}

export type WebItemView = WebItemFile | WebItemFolder;

export function buildWebItemViews(folders: Array<Folder>, items: Array<VideoSourceEntry>): Array<WebItemView> {
  const views = new Array<WebItemView>();
  const itemMap = group(items, 'folder');
  folders.forEach(folder => {
    const view: WebItemFolder = {
      id: folder.id,
      name: folder.name,
      cover: '',
      type: 'folder',
      order: folder.order,
      children: [],
      source: folder
    };
    itemMap.getOrDefault(folder.id, []).forEach(item => {
      view.children.push({
        id: item.id,
        name: item.title,
        cover: item.favicon,
        type: 'file',
        order: item.order,
        source: item
      })
    });
    view.children.sort((a, b) => a.order - b.order);
    views.push(view);
    itemMap.delete(folder.id);
  });
  // 没有目录
  Array.from(itemMap.values()).forEach(items => {
    items.forEach(item => {
      views.push({
        id: item.id,
        name: item.title,
        cover: item.favicon,
        type: 'file',
        order: item.order,
        source: item
      })
    })
  });
  // 重新排序
  views.sort((a, b) => a.order - b.order);
  return views;
}