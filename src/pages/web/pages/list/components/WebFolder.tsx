import {WebItemView} from "@/views/WebItemView.js";
import {DialogPlugin} from "tdesign-vue-next";
import WebItemContent from "@/pages/web/pages/list/components/WebItemContent.vue";

export function openWebFolderDialog(folder: WebItemView) {
  DialogPlugin({
    placement: "center",
    footer: false,
    closeBtn: false,
    draggable: true,
    width: "484px",
    header: () => <div class={'text-center w-full'}>{folder.name}</div>,
    default: () => <WebItemContent folder={folder.id} />,
  })

}