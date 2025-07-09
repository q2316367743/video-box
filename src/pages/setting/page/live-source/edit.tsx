import {Form, FormItem, Input, DialogPlugin, Switch} from "tdesign-vue-next";
import {Ref, ref} from "vue";
import {buildM3u8Core, LiveSource, M3u8Core} from "@/entities/LiveSource";
import {useLiveSourceStore} from "@/store";
import MessageUtil from "@/utils/modal/MessageUtil";

function buildForm(data: Ref<M3u8Core>) {
  return <Form data={data.value}>
    <FormItem label={'名称'} label-align={'top'}>
      <Input v-model={data.value.name} clearable={true}/>
    </FormItem>
    <FormItem label={'链接'} label-align={'top'}>{{
      default: () => <Input v-model={data.value.url} clearable={true} showLimitNumber={true} maxlength={255}/>,
      help: () => <span>如果不设置，则视为自定义订阅。</span>
    }}</FormItem>
    <FormItem label={'禁用超时检测'} label-align={'top'}>
      <Switch v-model={data.value.disableTimeout}/>
    </FormItem>
  </Form>
}

export function openAddDispositionDialog() {
  const data = ref(buildM3u8Core());
  const dp = DialogPlugin({
    header: '新增订阅',
    confirmBtn: '新增',
    draggable: true,
    placement: "center",
    default: () => buildForm(data),
    async onConfirm() {
      try {
        await useLiveSourceStore().add(data.value);
        MessageUtil.success("新增成功");
        dp.destroy();
      } catch (e) {
        MessageUtil.error("新增失败", e);
      }
    },
  })
}


export function openUpdateDispositionDialog(res: LiveSource, onOk: () => void) {
  const data = ref<M3u8Core>({
    id: res.id,
    name: res.name,
    url: res.url,
    disableTimeout: res.disableTimeout
  });
  const dp = DialogPlugin({
    header: '修改订阅',
    confirmBtn: '修改',
    placement: "center",
    draggable: true,
    default: () => buildForm(data),
    async onConfirm() {
      try {
        await useLiveSourceStore().update(data.value);
        MessageUtil.success("修改成功");
        dp.destroy();
        onOk();
      } catch (e) {
        MessageUtil.error("修改失败", e);
      }
    },
  })
}
