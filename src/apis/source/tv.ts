import {SourceTv, SourceTvForm, SourceTvInfo} from "@/views/SourceTv.js";
import {useGet, usePost, usePut} from "@/apis/common.js";

export function sourceTvAdd(data: SourceTvForm) {
  return usePost('/api/source/tv/add', data);
}

export function sourceTvList() {
  return useGet<Array<SourceTv>>('/api/source/tv/list');
}

export function sourceTvDel(id: string) {
  return usePost('/api/source/tv/del', {id});
}

export function sourceTvUpdate(id: string, data: SourceTvForm) {
  return usePut(`/api/source/tv/update/${id}`, data);
}

export function sourceTvInfo(id: string) {
  return useGet<SourceTvInfo>('/api/source/tv/info/${id}');
}

export function sourceTvRefresh(id: string) {
  return usePut(`/api/source/tv/refresh/${id}`);
}