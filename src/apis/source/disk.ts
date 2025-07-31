import {useGet} from "@/apis/common.ts";
import {DiskSourceEntry} from "@/types/SourceDisk.ts";

export function sourceDiskList() {
  return useGet<Array<DiskSourceEntry>>('/api/source/disk/list');
}

export function sourceDiskInfo(id: string) {
  return useGet<DiskSourceEntry>(`/api/source/disk/info/${id}`);
}