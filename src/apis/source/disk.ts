import {useGet} from "@/apis/common.ts";
import {DiskSourceEntry} from "@/types/SourceDisk.ts";

export function sourceDiskList() {
  return useGet<Array<DiskSourceEntry>>('/api/source/disk/list');
}