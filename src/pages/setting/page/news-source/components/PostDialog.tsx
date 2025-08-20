import { adminSourceNewsAdd, adminSourceNewsInfo, adminSourceNewsTest, adminSourceNewsUpdate } from "@/apis/admin/source/news";
import { SourceNews, SourceNewsItem, SourceNewsPost, SourceNewsRecord, SourceNewsType } from "@/types/SourceNews";
import MessageUtil from "@/utils/modal/MessageUtil";
import { Button, ColorPicker, DialogPlugin, Form, FormItem, FormRule, Input, InputNumber, Radio, RadioGroup, Space, Switch, TabPanel, Tabs } from "tdesign-vue-next";
import MonacoEditor from '@/components/MonacoEditor.vue';
import ImageUpload from "@/components/Upload/ImageUpload.vue";
import NewSourceView from "@/pages/news/components/NewSourceView.vue";

const formRules: Record<string, FormRule[]> = {
  title: [
    { required: true, message: '请输入资讯源名称', type: 'error' as const }
  ],
  website: [
    { required: true, message: '请输入网站地址', type: 'error' as const }
  ],
  script: [
    { required: true, message: '请输入JavaScript脚本', type: 'error' as const }
  ]
}
// Monaco Editor 配置
const editorOptions = {
  theme: 'vs-dark',
  fontSize: 14,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true
}


export function openPostDialog(loadData: () => void, row?: SourceNews) {

  const formData = ref<SourceNewsPost>({
    is_enabled: true,
    logo: '',
    title: '',
    tag: '',
    primary_color: '#1890ff',
    website: '',
    type: 1 as SourceNewsType,
    order: 0,
    script: ''
  });
  const records = ref<Array<SourceNewsRecord>>([]);
  const loading = ref(true);
  const submitLoading = ref(false);
  const previewLoading = ref(false);
  const isEdit = ref(!!row);
  const editId = ref(row?.id || '');
  const active = ref('base');

  if (row) {
    Object.assign(formData.value, {
      is_enabled: row.is_enabled === 1,
      logo: row.logo,
      title: row.title,
      tag: row.tag,
      primary_color: row.primary_color,
      website: row.website,
      type: row.type,
      order: row.order,
      script: '' // 初始为空，等待API返回
    })
    adminSourceNewsInfo(row.id).then(response => {
      formData.value.script = response.script;
      records.value = response.records;

    }).finally(() => loading.value = false)
  } else {
    loading.value = false
  }

  const source = computed<SourceNewsItem>(() => ({
    id: '0',
    created_at: 0,
    updated_at: 0,
    ...formData.value,
    is_enabled: 1,
    records: records.value
  }))

  const handleSubmit = async () => {
    if (submitLoading.value) return

    submitLoading.value = true
    try {
      if (isEdit.value) {
        await adminSourceNewsUpdate(editId.value, formData.value)
        MessageUtil.success('更新成功')
      } else {
        await adminSourceNewsAdd(formData.value)
        MessageUtil.success('添加成功')
      }
      loadData();
      dp.destroy();
    } catch (error) {
      MessageUtil.error(isEdit.value ? '更新失败' : '添加失败')
    } finally {
      submitLoading.value = false
    }
  }

  const handleCancel = () => {
    dp.destroy();
  }
  const handlePreview = () => {
    if (previewLoading.value) return;
    previewLoading.value = true
    adminSourceNewsTest(formData.value).then(res => {
      records.value = res;
    }).finally(() => previewLoading.value = false)
  }

  const dp = DialogPlugin({
    header: (isEdit.value ? '编辑' : '新增') + '新闻源',
    placement: 'center',
    width: "1200px",
    default: () => <div class="flex gap-24px h-462px">
      <div class="flex flex-300 pr-24px overflow-auto" style={{ borderRight: '1px solid var(--td-border-level-2-color)' }}>
        <NewSourceView source={source.value} disabled={true} />
      </div>
      <div class="flex-auto flex flex-col">
        <Tabs v-model={active.value} v-slots={{
          action: () => <>{active.value === 'script' && <Button theme="primary" onClick={handlePreview} loading={previewLoading.value}>预览</Button>}</>
        }}>
          <TabPanel label="基本信息" value="base">
            <div class={'h-406px overflow-auto'}>
              <Form data={formData.value} rules={formRules} label-width="100px" onSubmit={handleSubmit} class='mt-8px'>
                <FormItem label="资讯源名称" name="title">
                  <Input v-model={formData.value.title} placeholder="请输入资讯源名称" />
                </FormItem>
                <FormItem label="Logo" name="logo">
                  <ImageUpload v-model={formData.value.logo} />
                </FormItem>
                <FormItem label="标签" name="tag">
                  <Input v-model={formData.value.tag} placeholder="请输入标签" />
                </FormItem>
                <FormItem label="主题色" name="primary_color">
                  <ColorPicker v-model={formData.value.primary_color} format="HEX" />
                </FormItem>
                <FormItem label="网站地址" name="website">
                  <Input v-model={formData.value.website} placeholder="请输入网站地址" />
                </FormItem>
                <FormItem label="类型" name="type">
                  <RadioGroup v-model={formData.value.type} >
                    <Radio value={1} label="热点" />
                    <Radio value={2} label="实时" />
                  </RadioGroup>
                </FormItem>
                <FormItem label="排序" name="order" help="越小越靠前">
                  <InputNumber v-model={formData.value.order} placeholder="请输入排序值" />
                </FormItem>
                <FormItem label="状态" name="is_enabled">
                  <Switch v-model={formData.value.is_enabled} />
                </FormItem>
              </Form>
            </div>
          </TabPanel>
          <TabPanel label="JavaScript 脚本" value="script">
            <div class="flex-auto overflow-hidden mt-8px" style={{ border: '1px solid var(--td-border-level-2-color)', borderRadius: 'var(--td-radius-medium)' }} >
              <MonacoEditor v-model={formData.value.script} language={"javascript"} height={404} options={editorOptions} />
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </div>,
    footer: () => <Space size={'small'}>
      <Button variant="outline" onClick={handleCancel}>取消</Button>
      <Button theme="primary" onClick={handleSubmit} loading={submitLoading.value}>
        保存
      </Button>
    </Space>
  })
}