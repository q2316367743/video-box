import {DirItem} from "@/apis/plugin/disk/readDir.ts";
import {pluginDiskLink} from "@/apis/plugin/disk/link.ts";
import {DialogPlugin} from "tdesign-vue-next";

export async function openDiskVideoDialog(sourceId: string, item: DirItem) {
  const link = await pluginDiskLink(sourceId, item.path);
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