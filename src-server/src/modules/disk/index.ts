import {DiskDriver, DiskSourceView} from "@/types/SourceDisk";
import {DiskPlugin} from "@/modules/disk/DiskPlugin.js";
import {CustomForm} from "@/types/CustomForm";
import {DiskPluginForAListV3} from "@/modules/disk/impl/alist-v3/driver";
import {DiskPluginForWebDAV} from "@/modules/disk/impl/webdav/driver";
import {DiskPluginForQuarkOpen} from "@/modules/disk/impl/quark-open/driver";
import {DiskDriverForQuarkOrUc} from "@/modules/disk/impl/quark-or-uc/driver";
import {DiskPropsForAListV3} from "@/modules/disk/impl/alist-v3/props";
import {DiskPropsForWebDAV} from "@/modules/disk/impl/webdav/props";
import {DiskPropsForQuarkOpen} from "@/modules/disk/impl/quark-open/props";
import {DiskPropsForQuarkOrUc} from "@/modules/disk/impl/quark-or-uc/props";

export function buildDiskPlugin(source: DiskSourceView): DiskPlugin {
  switch (source.driver) {
    case "A_LIST_V3":
      return new DiskPluginForAListV3(source);
    case "WEB_DAV":
      return new DiskPluginForWebDAV(source);
    case 'QUARK_OPEN':
      return new DiskPluginForQuarkOpen(source);
    case 'QUARK':
      return new DiskDriverForQuarkOrUc(source, {
        ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) quark-cloud-drive/2.5.20 Chrome/100.0.4896.160 Electron/18.3.5.4-b478491100 Safari/537.36 Channel/pckk_other_ch",
        referer: "https://pan.quark.cn",
        api: "https://drive.quark.cn/1/clouddrive",
        pr: "ucpro",
        name: 'Quark',
        defaultRoot: '0',
        noOverwriteUpload: true,
        onlyProxy: false
      });
    case 'UC':
      return new DiskDriverForQuarkOrUc(source, {
        ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) uc-cloud-drive/2.5.20 Chrome/100.0.4896.160 Electron/18.3.5.4-b478491100 Safari/537.36 Channel/pckk_other_ch",
        referer: "https://drive.uc.cn",
        api: "https://pc-api.uc.cn/1/clouddrive",
        pr: "UCBrowser",
        name: 'UC',
        onlyProxy: true,
        defaultRoot: '0',
        noOverwriteUpload: true
      });
    default:
      throw new Error(`不支持的磁盘驱动: ${source.driver}`);
  }
}

export const DiskPluginOptions: Array<{ label: string, value: DiskDriver, disabled?: boolean }> = [{
  label: 'AList V3',
  value: 'A_LIST_V3'
}, {
  label: 'WebDAV',
  value: 'WEB_DAV'
}, {
  label: '夸克网盘-开放',
  value: 'QUARK_OPEN',
  disabled: true
}, {
  label: '夸克网盘',
  value: 'QUARK'
}, {
  label: 'UC网盘',
  value: 'UC'
}]

export const DiskPluginProps: Record<DiskDriver, Array<CustomForm>> = {
  'A_LIST_V3': DiskPropsForAListV3,
  'WEB_DAV': DiskPropsForWebDAV,
  'QUARK_OPEN': DiskPropsForQuarkOpen,
  'QUARK': DiskPropsForQuarkOrUc,
  'UC': DiskPropsForQuarkOrUc
}