import { useDelete, useGet, usePost, usePut } from "@/apis/common";
import { SourceNews, SourceNewsInfoView, SourceNewsPost, SourceNewsRecord } from "@/types/SourceNews";

export function adminSourceNewsList() {
  return useGet<Array<SourceNews>>('/api/admin/source/news/list')
}

export function adminSourceNewsAdd(body: SourceNewsPost) {
  return usePost('/api/admin/source/news/add', body)
}

export function adminSourceNewsUpdate(id: string, body: SourceNewsPost) {
  return usePut('/api/admin/source/news/update/' + id, body)
}

export function adminSourceNewsEnable(id: string) {
  return usePut('/api/admin/source/news/enable/' + id)
}

export function adminSourceNewsDelete(id: string) {
  return useDelete('/api/admin/source/news/delete/' + id)
}

export function adminSourceNewsInfo(id: string) {
  return useGet<SourceNewsInfoView>('/api/admin/source/news/info/' + id)
}

export function adminSourceNewsTest(body: SourceNewsPost) {
  return usePost<Array<SourceNewsRecord>>('/api/admin/source/news/test', body)
}
