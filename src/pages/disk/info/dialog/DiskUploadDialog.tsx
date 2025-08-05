import {DialogPlugin, Form, FormItem, Switch, TdUploadProps, Upload} from "tdesign-vue-next";
import {pluginDiskUpload} from "@/apis/plugin/disk/link.ts";
import {useUserStore} from "@/store/UserStore.ts";

export function openDiskUploadDialog(sourceId: string, path: string, onUpdate: () => void) {

  const requestMethod: TdUploadProps['requestMethod'] = async files => {
    const f = Array.isArray(files) ? files[0] : files;
    const {raw} = f;
    if (!raw) return {status: 'fail', error: '文件未找到', response: {}};
    await pluginDiskUpload(sourceId, path, raw, true);
    const url = `/api/proxy/disk/${sourceId}/p${path}?authorization=${useUserStore().token}`;
    onUpdate();
    return {status: 'success', response: {url}};
  }

  // TODO 文件上传使用新的组件
  DialogPlugin({
    header: '文件上传',
    placement: "center",
    draggable: true,
    footer: false,
    width: '402px',
    onConfirm() {
    },
    default: () => <Form>
      <FormItem labelAlign={'top'}>
        <Upload draggable requestMethod={requestMethod} class={'w-400px'}/>
      </FormItem>
      <FormItem label={'作为任务'}>
        <Switch/>
      </FormItem>
    </Form>
  })
}