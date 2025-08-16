import { useGet, usePost, usePut, useDelete } from "@/apis/common";
import { SourceAi, SourceAiCore, SourceAiModel } from "@/types/SourceAi";

export function adminSourceAiList() {
  return useGet<Array<SourceAi>>('/api/admin/source/ai/list');
}

export function adminSourceAiAdd(data: SourceAiCore) {
  return usePost<void>('/api/admin/source/ai/add', data);
}

export function adminSourceAiUpdate(id: string, data: SourceAiCore) {
  return usePut<void>('/api/admin/source/ai/update/' + id, data);
}

export function adminSourceAiDel(id: string) {
  return useDelete<void>('/api/admin/source/ai/delete/' + id);
}

export function adminSourceAModels(id: string) {
  return useGet<Array<SourceAiModel>>('/api/admin/source/ai/model/' + id);
}
export function adminSourceAiRefresh(id: string) {
  return usePost<void>('/api/admin/source/ai/refresh/' + id);
}