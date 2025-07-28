import {useGet, usePost} from "@/apis/common.ts";

export function adminSettingOption() {
  return useGet<Array<any>>('/api/admin/setting/gbal/option');
}


export function adminSettingAll() {
  return useGet<Record<string, any>>('/api/admin/setting/all');
}


export function adminSettingSave(data: Record<string, any>) {
  return usePost('/api/admin/setting//save', data);
}