import {PageResponse, useDelete, useGet, usePost, usePut} from "@/apis/common";
import {MyVideoItemView, MyVideoItemCore, MyVideoItemForm} from "@/views/MyVideoItemView";

export function myVideoItemDelete(id: string) {
  return useDelete(`/api/my/video-item/delete/${id}`);
}

export function myVideoItemExist(data: MyVideoItemCore) {
  return useGet<boolean>('/api/my/video-item/exist', data);
}

interface MyVideoItemListProps {
  type: string;
  pageNum: number;
  pageSize: number;
}
export function myVideoItemList(props: MyVideoItemListProps) {
  return useGet<PageResponse<MyVideoItemView>>('/api/my/video-item/list', props)
}

export function myVideoItemPost(data: MyVideoItemForm) {
  return usePost('/api/my/video-item/post', data)
}


export function myVideoItemToggle(data: MyVideoItemForm) {
  return usePut('/api/my/video-item/toggle', data)
}