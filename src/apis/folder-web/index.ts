import {Folder} from "@/views/Folder.js";
import {useDelete, useGet, usePost, usePut} from "@/apis/common.js";

export function folderWebList(): Promise<Array<Folder>> {
  return useGet<Array<Folder>>('/api/folder/web/list');
}

export function folderWebPost(name: string) {
  return usePost('/api/folder/web/post', {name});
}

export function folderWebRename(id: string, name: string) {
  return usePut('/api/folder/web/rename', {id, name});
}


export function folderWebSort(data: Array<{ id: string, order: number }>) {
  return usePut('/api/folder/web/order', data);
}

export function folderWebDelete(id: string) {
  return useDelete('/api/folder/web/delete', {id});
}