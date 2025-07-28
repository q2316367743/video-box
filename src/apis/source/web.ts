import {useGet, usePost, usePut} from "@/apis/common";
import {SourceWeb} from "@/views/SourceWeb";


export function sourceWebList(folder: string): Promise<Array<SourceWeb>> {
  return useGet<Array<SourceWeb>>(`/api/source/web/list/${folder}`);
}


export function sourceWebMove(id: string, folder: string) {
  return usePost('/api/source/web/move', {id, folder});
}

export function sourceWebInfo(id: string) {
  return useGet<SourceWeb>(`/api/source/web/info/${id}`);
}

export function sourceWebSort(data: Array<{ id: string, folder: boolean, order: number }>) {
  return usePut('/api/source/web/sort', data);
}

export function sourceWebRefresh(id: string) {
  return useGet(`/api/source/web/refresh/${id}`);
}
