import {DirItem} from "@/apis/plugin/disk/readDir.ts";
import {DialogPlugin} from "tdesign-vue-next";
import {proxyDiskP} from "@/apis/proxy.ts";

export async function openDiskVideoDialog(sourceId: string, item: DirItem) {
  const link = proxyDiskP(sourceId, item.path, item.sign);
  DialogPlugin({
    header: item.name,
    placement: "center",
    footer: false,
    closeBtn: false,
    draggable: true,
    default: () => <video controls={'true'}>
      <source src={link}/>
    </video>,
  })
}