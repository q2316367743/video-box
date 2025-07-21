import {WebItemView} from "@/views/WebItemView.js";
import {useDelete, useGet, usePost, usePut} from "@/apis/common.js";
import {SourceWeb, SourceWebForm} from "@/views/SourceWeb.js";
import {download} from "@/utils/lang/BrowserUtil.js";

export function sourceWebHome(folder: string): Promise<Array<WebItemView>> {
  return useGet<Array<WebItemView>>(`/api/source/web/home/${folder}`);
}

export function sourceWebList(folder: string): Promise<Array<SourceWeb>> {
  return useGet<Array<WebItemView>>(`/api/source/web/list/${folder}`);
}

export async function sourceWebImport(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  await usePost('/api/source/web/import', formData);
}

export async function sourceWebExport() {
  const text = await usePost('/api/source/web/export', null, {
    responseType: 'text'
  });
  download(text, '数据导出.json', 'application/json');
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

export function sourceWebDelete(id: string) {
  return useDelete(`/api/source/web/delete/${id}`);
}