import {WebItemView} from "@/views/WebItemView.js";
import {useGet, usePost, usePut} from "@/apis/common.js";
import {SourceWeb, SourceWebForm} from "@/views/SourceWeb.js";

export function sourceWebHome(folder: string): Promise<Array<WebItemView>> {
  return useGet<Array<WebItemView>>(`/api/source/web/home/${folder}`);
}

export async function sourceWebImport(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const rsp = await usePost('/api/source/web/import', formData);
  console.log(rsp);
}

export function sourceWebMove(id: string, folder: string) {
  return usePost('/api/source/web/move', {id, folder});
}

export function sourceWebInfo(id: string) {
  return useGet<SourceWeb>(`/api/source/web/info/${id}`);
}

export function sourceWebAdd(data: SourceWebForm) {
  return usePost(`/api/source/web/add`, data);
}

export function sourceWebUpdate(id: string, data: SourceWebForm) {
  return usePut(`/api/source/web/update/${id}`, data);
}