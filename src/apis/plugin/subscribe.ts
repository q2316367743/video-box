import {
  SourceSubscribe,
  SourceSubscribeRecordListView,
  SourceSubscribeRecordView
} from "@/types/SourceSubscribe";
import { PageResponse, useGet } from "../common";

// 查询一个展示类型下全部的订阅项
export function pluginSubscribeList(display: number) {
  return useGet<Array<SourceSubscribe>>(`/api/plugin/subscribe/list/${display}`);
}

// 分页查询一个订阅下的记录
export function PluginSubscribeRecord(display: string, id: string, pageNum: number, pageSize: number) {
  return useGet<PageResponse<SourceSubscribeRecordListView>>(`/api/plugin/subscribe/record/${display}/${id}`, {
    params: {
      pageNum,
      pageSize
    }
  });
}

// 获取一个订阅的详情
export function pluginSubscribeContent(id: string) {
  // display=1是content，其余的是record
  return useGet<SourceSubscribeRecordView>(`/api/plugin/subscribe/content/${id}`);
}

// 强制刷新一个订阅记录
export function pluginSubscribeRefresh(id: string) {
  return useGet(`/api/plugin/subscribe/refresh/${id}`);
}

// 已读一个记录
export function pluginSubscribeRead(id: string) {
  return useGet(`/api/plugin/subscribe/read/${id}`);
}

export interface DisplayStatistics {
  display: number;
  record_count: number;
}

// 获取一个订阅的详情
export function pluginSubscribeDisplay() {
  // display=1是content，其余的是record
  return useGet<Array<DisplayStatistics>>(`/api/plugin/subscribe/display`);
}


