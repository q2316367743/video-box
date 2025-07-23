import {WebItemView} from "@/views/WebItemView.js";
import {DialogPlugin} from "tdesign-vue-next";
import WebSourceContent from "@/pages/setting/page/web-source/components/WebSourceContent.vue";

export function openWebFolderDialog(folder: WebItemView) {
  function onChoose() {
    dp.destroy();
  }

  const dp = DialogPlugin({
    placement: "center",
    footer: false,
    closeBtn: false,
    draggable: true,
    width: "484px",
    header: () => <div class={'text-center w-full'}>{folder.name}</div>,
    default: () => <WebSourceContent folder={folder.id} onChoose={onChoose}/>,
  })

}