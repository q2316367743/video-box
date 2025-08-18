import { toolManageAdd } from "@/apis/tool/manage";
import { AiToolPost } from "@/types/AiTool";
import MessageUtil from "@/utils/modal/MessageUtil";
import { Col, DialogPlugin, Form, FormItem, Input, Row, TagInput, Textarea } from "tdesign-vue-next";

export function openChat2ToolDialog(content: string, onSuccess: () => void) {
  const form = ref<AiToolPost>({
    icon: '',
    title: '',
    description: '',
    tags: [],
    content: content
  })
  const dp = DialogPlugin({
    header: '添加为工具',
    placement: 'center',
    confirmBtn: '新增',
    default: () => <Form>
      <FormItem label={'标题'} name={'title'} rules={[{ required: true, message: '标题必填' }]}>
        <Input clearable v-model={[form.value.title]} />
      </FormItem>
      <FormItem label={'标签'} name={'tags'}>
        <TagInput v-model={form.value.tags} />
      </FormItem>
      <FormItem label={'描述'} name={'description'} >
        <Textarea v-model={[form.value.description]} autosize={{ minRows: 3, maxRows: 6 }} />
      </FormItem>
    </Form>,
    onConfirm() {
      toolManageAdd(form.value).then(() => {
        MessageUtil.success('添加成功');
        dp.destroy();
        onSuccess()
      });
      
    },
  })
}