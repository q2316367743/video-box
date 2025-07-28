import {useDelete, useGet, usePost, usePut} from "@/apis/common";
import {SourceWeb, SourceWebForm} from "@/views/SourceWeb";
import {download} from "@/utils/lang/BrowserUtil";


export function adminSourceWebList(folder: string): Promise<Array<SourceWeb>> {
  return useGet<Array<SourceWeb>>(`/api/admin/source/web/list`);
}

export async function adminSourceWebImport(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  await usePost('/api/admin/source/web/import', formData);
}

export async function adminSourceWebExport() {
  const text = await usePost('/api/admin/source/web/export', null, {
    responseType: 'text'
  });
  download(text, '数据导出on', 'application/json');
}


export function adminSourceWebAdd(data: SourceWebForm) {
  return usePost(`/api/admin/source/web/add`, data);
}

export function adminSourceWebUpdate(id: string, data: SourceWebForm) {
  return usePut(`/api/admin/source/web/update/${id}`, data);
}

export function adminSourceWebDelete(id: string) {
  return useDelete(`/api/admin/source/web/delete/${id}`);
}

export function adminSourceWebEnable(id: string) {
  return usePut(`/api/admin/source/web/enable/${id}`);
}

