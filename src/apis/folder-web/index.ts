import {Folder} from "@/entities/Folder.js";
import {useGet, usePost} from "@/apis/common.js";

export function folderWebList(): Promise<Array<Folder>> {
  return useGet<Array<Folder>>('/api/folder/web/list');
}

export function folderWebPost(name: string) {
  return usePost('/api/folder/web/post', {name});
}