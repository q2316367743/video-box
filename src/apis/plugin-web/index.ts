import {VideoCategoryResult, VideoDetail, VideoHome, VideoSearchResult} from "@/modules/video/VideoPlugin.js";
import {useGet} from "@/apis/common.js";

export function pluginWebHome(id: string, page: number) {
  return useGet<VideoHome>(`/api/plugin/web/home/${id}`, {page});
}


export function pluginWebList(id: string, categoryId: string, page: number) {
  return useGet<VideoCategoryResult>(`/api/plugin/web/list/${id}`, {categoryId, page});
}


export function pluginWebSearch(id: string, keyword: string, page: number) {
  return useGet<VideoSearchResult>(`/api/plugin/web/search/${id}`, {keyword, page});
}


export function pluginWebDetail(id: string, videoId: string) {
  return useGet<VideoDetail>(`/api/plugin/web/detail/${id}`, {videoId});
}