import {useDelete, useGet, usePost, usePut} from "@/apis/common.js";
import {MyVideoItemView, MyVideoItemCore, MyVideoItemForm} from "@/views/MyVideoItemView.js";

export function myVideoItemDelete(id: string) {
  return useDelete(`/api/my/video-item/delete/${id}`);
}

export function myVideoItemExist(data: MyVideoItemCore) {
  return useGet<boolean>('/api/my/video-item/exist', data);
}

export function myVideoItemList() {
  return useGet<Array<MyVideoItemView>>('/api/my/video-item/list')
}

export function myVideoItemPost(data: MyVideoItemForm) {
  return usePost('/api/my/video-item/post', data)
}


export function myVideoItemToggle(data: MyVideoItemForm) {
  return usePut('/api/my/video-item/toggle', data)
}