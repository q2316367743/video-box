import {Form, FormItem, Input, DialogPlugin, Switch} from "tdesign-vue-next";
import MessageUtil from "@/utils/modal/MessageUtil.js";
import {SourceTv, SourceTvForm} from "@/views/SourceTv.js";
import {sourceTvAdd, sourceTvUpdate} from "@/apis/source/tv.js";

function buildForm(data: Ref<SourceTvForm>) {
  return <Form data={data.value}>
    <FormItem label={'名称'} label-align={'top'}>
      <Input v-model={data.value.name} clearable={true}/>
    </FormItem>
    <FormItem label={'链接'} label-align={'top'}>{{
      default: () => <Input v-model={data.value.url} clearable={true} showLimitNumber={true} maxlength={255}/>,
      help: () => <span>如果不设置，则视为自定义订阅。</span>
    }}</FormItem>
    <FormItem label={'超时检测'} label-align={'top'}>
      <Switch v-model={data.value.timeout} customValue={[1, 0]}/>
    </FormItem>
  </Form>
}

export function openAddDispositionDialog(onOk: () => void) {
  const data = ref<SourceTvForm>({
    timeout: 1,
    url: '',
    name: ''
  });
  const dp = DialogPlugin({
    header: '新增订阅',
    confirmBtn: '新增',
    draggable: true,
    placement: "center",
    default: () => buildForm(data),
    async onConfirm() {
      try {
        await sourceTvAdd(data.value);
        MessageUtil.success("新增成功");
        dp.destroy();
        onOk();
      } catch (e) {
        console.error(e);
      }
    },
  })
}


export function openUpdateDispositionDialog(res: SourceTv, onOk: () => void) {
  const data = ref<SourceTvForm>({
    name: res.name,
    url: res.url,
    timeout: res.timeout
  });
  const dp = DialogPlugin({
    header: '修改订阅',
    confirmBtn: '修改',
    placement: "center",
    draggable: true,
    default: () => buildForm(data),
    async onConfirm() {
      try {
        await sourceTvUpdate(res.id, data.value);
        MessageUtil.success("修改成功");
        dp.destroy();
        onOk();
      } catch (e) {
        console.error(e);
      }
    },
  })
}
