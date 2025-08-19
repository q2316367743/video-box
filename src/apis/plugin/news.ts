import { SourceNewsItem } from "@/types/SourceNews";
import { useGet, usePut } from "../common";

export function pluginNewsList() {
  return useGet<Array<SourceNewsItem>>("/api/plugin/news/list");
}
export function pluginNewsInfo(id: string) {
  return useGet<SourceNewsItem>("/api/plugin/news/info/" + id);
}

export function pluginNewsRefresh(id: string) {
  return usePut<void>("/api/plugin/news/refresh/" + id);
}