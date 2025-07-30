import {DirItem} from "@/apis/plugin/disk/readDir.ts";
import {videoTypes} from "@/pages/disk/info/constants.ts";
import {openDiskVideoDialog} from "@/pages/disk/info/preview/components/DiskVideoDialog.tsx";

export function openDiskFile(sourceId: string, item: DirItem) {
  if (videoTypes.includes(item.extname)) {
    openDiskVideoDialog(sourceId, item);
  }
}