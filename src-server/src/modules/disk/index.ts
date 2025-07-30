import {DiskDriver, DiskSourceEntry} from "@/types/SourceDisk";
import {DiskPlugin} from "@/modules/disk/DiskPlugin.js";
import {DiskPluginForAListV3} from "@/modules/disk/impl/alist-v3/DiskPluginForAListV3";
import {DiskPluginForWebDAV} from "@/modules/disk/impl/webdav/DiskPluginForWebDAV";
import {DiskPropsForAListV3} from "@/modules/disk/impl/alist-v3/DiskPropsForAListV3";
import {CustomForm} from "@/types/CustomForm";
import {DiskPropsForWebDAV} from "@/modules/disk/impl/webdav/DiskPropsForWebDAV";

export function buildDiskPlugin(source: DiskSourceEntry): DiskPlugin {
  switch (source.driver) {
    case "A_LIST_V3":
      return new DiskPluginForAListV3(source);
    case "WEB_DAV":
      return new DiskPluginForWebDAV(source);
    default:
      throw new Error(`不支持的磁盘驱动: ${source.driver}`);
  }
}

export const DiskPluginOptions: Array<{ label: string, value: DiskDriver }> = [{
  label: 'AList V3',
  value: 'A_LIST_V3'
}, {
  label: 'WebDAV',
  value: 'WEB_DAV'
}]

export const DiskPluginProps: Record<DiskDriver, Array<CustomForm>> = {
  'A_LIST_V3': DiskPropsForAListV3,
  'WEB_DAV': DiskPropsForWebDAV
}