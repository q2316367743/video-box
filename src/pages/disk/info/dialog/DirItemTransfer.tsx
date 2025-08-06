import {DirItem} from "@/apis/plugin/disk/list.ts";
import {DialogPlugin} from "tdesign-vue-next";
import {pluginDiskCopy, pluginDiskMove} from "@/apis/plugin/disk/link.ts";
import MessageUtil from "@/utils/modal/MessageUtil.ts";
import DiskFolderSelect from "@/components/DiskFolderSelect.vue";

export function openDirItemTransfer(mv: boolean, sourceId: string, item: DirItem, onUpdate: () => void) {
  const folder = ref(['/']);
  const dp = DialogPlugin({
    header: '选择目标文件夹',
    placement: "center",
    draggable: true,
    onConfirm() {
      dp.setConfirmLoading(true);
      (mv ? pluginDiskMove : pluginDiskCopy)(sourceId, item.path, folder.value[0])
        .then(() => {
          MessageUtil.success(mv ? '移动成功' : '复制成功');
          onUpdate()
        }).finally(() => {
        dp.setConfirmLoading(false);
        dp.destroy();
      })
    },
    default: () => <div class={'m-height-50vh'}>
      <DiskFolderSelect v-model={folder.value} sourceId={sourceId} path={item.path}/>
    </div>
  })
}