import {DirItem} from "@/apis/plugin/disk/list.ts";
import {RemovableRef} from "@vueuse/core";

export interface DiskInfoInstance {
  current: Ref<DirItem | undefined>;
  sortType: RemovableRef<SortType>;
  orderType: RemovableRef<OrderType>;
  setPath: (item: DirItem) => void;
  setDragPath: (path: string) => void;
  getDragPath: () => string | undefined;
}

export const diskInfoKey = Symbol() as InjectionKey<DiskInfoInstance>

export type SortType = 'name' | 'size' | 'type' | 'extname' | 'lastModified';
export type OrderType = 'asc' | 'desc';

export function sortFunc(a: DirItem, b: DirItem, sort: SortType, order: OrderType) {
  if (sort === 'name') {
    return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
  } else if (sort === 'size') {
    return order === 'asc' ? a.size - b.size : b.size - a.size;
  } else if (sort === 'lastModified') {
    return order === 'asc' ? a.lastModified - b.lastModified : b.lastModified - a.lastModified;
  }else if (sort === 'type') {
    return order === 'asc' ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type);
  } else if (sort === 'extname') {
    return order === 'asc' ? a.extname.localeCompare(b.extname) : b.extname.localeCompare(a.extname);
  }
  return 0
}