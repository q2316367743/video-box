import { defineComponent, ref, reactive } from 'vue'
import { DialogPlugin, Form, FormItem, Input, Select, Option, Button, Space, RadioGroup, Radio, Textarea } from 'tdesign-vue-next'
import type { SourceAi, SourceAiCore } from '@/types/SourceAi'
import { adminSourceAiAdd, adminSourceAiUpdate } from '@/apis/admin/source/ai'
import { MessagePlugin } from 'tdesign-vue-next'
import type { FormRule } from 'tdesign-vue-next'

interface AiSourceDialogProps {
  editData?: SourceAi | null
  onConfirm: () => void
  onCancel: () => void
}

export const openAiSourceDialog = (props: AiSourceDialogProps) => {
  const formRef = ref()
  const loading = ref(false)
  
  const formData = reactive<SourceAiCore>({
    driver: 1,
    name: '',
    description: '',
    url: '',
    token: '',
    is_enabled: 1
  })

  // 如果是编辑模式，填充表单数据
  if (props.editData) {
    Object.assign(formData, {
      driver: props.editData.driver,
      name: props.editData.name,
      description: props.editData.description,
      url: props.editData.url,
      token: props.editData.token,
      is_enabled: props.editData.is_enabled
    })
  }

  const rules: Record<string, FormRule[]> = {
    name: [
      { required: true, message: '请输入AI源名称', trigger: 'blur' },
      { min: 2, max: 50, message: '名称长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    url: [
      { required: true, message: '请输入URL', trigger: 'blur' },
      { url: true, message: '请输入有效的URL地址', trigger: 'blur' }
    ],
    token: [
      { required: true, message: '请输入Token', trigger: 'blur' }
    ],
    driver: [
      { required: true, message: '请选择驱动类型', trigger: 'change' }
    ],
    is_enabled: [
      { required: true, message: '请选择状态', trigger: 'change' }
    ]
  }

  const handleSubmit = async () => {
    const valid = await formRef.value?.validate()
    if (valid !== true) return

    loading.value = true
    try {
      if (props.editData) {
        await adminSourceAiUpdate(props.editData.id, formData)
        MessagePlugin.success('更新成功')
      } else {
        await adminSourceAiAdd(formData)
        MessagePlugin.success('新增成功')
      }
      props.onConfirm()
      dialog.destroy()
    } catch (error: any) {
      if (error.message) {
        MessagePlugin.error(error.message)
      } else {
        MessagePlugin.error(props.editData ? '更新失败' : '新增失败')
      }
    } finally {
      loading.value = false
    }
  }

  const dialog = DialogPlugin({
    header: props.editData ? '编辑AI源' : '新增AI源',
    width: 600,
    body: () => (
      <Form
        ref={formRef}
        data={formData}
        rules={rules}
        labelWidth="100px"
      >
        <FormItem label="驱动类型" name="driver">
          <Select v-model={formData.driver} placeholder="请选择驱动类型">
            <Option value={1} label="OpenAI" />
          </Select>
        </FormItem>
        
        <FormItem label="名称" name="name">
          <Input
            v-model={formData.name}
            placeholder="请输入AI源名称"
          />
        </FormItem>
        
        <FormItem label="URL" name="url">
          <Input
            v-model={formData.url}
            placeholder="请输入API URL"
          />
        </FormItem>
        
        <FormItem label="Token" name="token">
          <Input
            v-model={formData.token}
            type="password"
            placeholder="请输入API Token"
          />
        </FormItem>
        
        <FormItem label="状态" name="is_enabled">
          <RadioGroup v-model={formData.is_enabled}>
            <Radio value={1}>启用</Radio>
            <Radio value={0}>禁用</Radio>
          </RadioGroup>
        </FormItem>
        
        <FormItem label="描述" name="description">
          <Textarea
            v-model={formData.description}
            autosize={{ minRows: 3, maxRows: 5 }}
            placeholder="请输入描述信息（可选）"
          />
        </FormItem>
      </Form>
    ),
    footer: () => (
      <Space>
        <Button onClick={() => dialog.destroy()}>取消</Button>
        <Button
          theme="primary"
          loading={loading.value}
          onClick={handleSubmit}
        >
          确定
        </Button>
      </Space>
    ),
    onClose: () => {
      props.onCancel();
      dialog.destroy();
    }
  })

  return dialog
}

export default defineComponent({
  name: 'AiSourceDialog'
})