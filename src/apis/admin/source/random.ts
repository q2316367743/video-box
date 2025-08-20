import { useDelete, useGet, usePost, usePut } from "@/apis/common";
import { SourceRandom, SourceRandomInfo, SourceRandomPost } from "@/types/SourceRandom";

export function adminSourceRandomList() {
  return useGet<Array<SourceRandom>>('/api/admin/source/random/list');
}

export function adminSourceRandomInfo(id: string) {
  return useGet<SourceRandomInfo>('/api/admin/source/random/info/' + id);
}

export function adminSourceRandomAdd(data: SourceRandomPost) {
  return usePost('/api/admin/source/random/add', data);
}

export function adminSourceRandomUpdate(id: string, data: SourceRandomPost) {
  return usePut('/api/admin/source/random/update/' + id, data);
}

export function adminSourceRandomDelete(id: string) {
  return useDelete('/api/admin/source/random/delete/' + id);
}