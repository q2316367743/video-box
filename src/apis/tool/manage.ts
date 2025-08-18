import { AiTool, AiToolInfo, AiToolPost } from "@/types/AiTool";
import { useDelete, useGet, usePost, usePut } from "../common";

export function toolManageList() {
  return useGet<AiTool[]>('/api/tool/manage/list');
}

export function toolManageInfo(id: string) {
  return useGet<AiToolInfo>(`/api/tool/manage/info/${id}`);
}

export function toolManageAdd(body: AiToolPost) {
  return usePost('/api/tool/manage/add', body);
}

export function toolManageUpdate(id: string, body: AiToolPost) {
  return usePut('/api/tool/manage/update/' + id, body);
}

export function toolManageDelete(id: string) {
  return useDelete('/api/tool/manage/delete/' + id);
}


