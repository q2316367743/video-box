import { adminSourceRandomAdd, adminSourceRandomInfo, adminSourceRandomUpdate } from "@/apis/admin/source/random";
import { SourceRandom, SourceRandomPost } from "@/types/SourceRandom";
import MessageUtil from "@/utils/modal/MessageUtil";
import { Button, DialogPlugin, Form, FormItem, FormRule, Input, Space, TagInput, Textarea } from "tdesign-vue-next";
import MonacoEditor from '@/components/MonacoEditor.vue';
import ImageUpload from "@/components/Upload/ImageUpload.vue";

const formRules: Record<string, FormRule[]> = {
  name: [
    { required: true, message: '请输入随机源名称', type: 'error' as const },
    { min: 1, max: 50, message: '名称长度在 1 到 50 个字符', type: 'error' as const }
  ],
  description: [
    { max: 200, message: '描述长度不能超过 200 个字符', type: 'error' as const }
  ],
  script: [
    { required: true, message: '请输入脚本内容', type: 'error' as const }
  ]
}

// Monaco Editor 配置
const editorOptions = {
  theme: 'vs-dark',
  fontSize: 14,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  insertSpaces: true
}

export function openPostDialog(loadData: () => void, row?: SourceRandom) {
  const formData = ref<SourceRandomPost>({
    icon: '',
    name: '',
    description: '',
    tags: [],
    script: ''
  });

  const loading = ref(true);
  const submitLoading = ref(false);
  const isEdit = ref(!!row);
  const editId = ref(row?.id || '');

  if (row) {
    Object.assign(formData.value, {
      icon: row.icon,
      name: row.name,
      description: row.description,
      tags: row.tags || [],
      script: '' // 初始为空，等待API返回
    });

    adminSourceRandomInfo(row.id).then(response => {
      formData.value.script = response.script || '';
    }).finally(() => loading.value = false);
  } else {
    loading.value = false;
  }

  const handleSubmit = async () => {
    if (submitLoading.value) return;

    submitLoading.value = true;
    try {
      if (isEdit.value) {
        await adminSourceRandomUpdate(editId.value, formData.value);
        MessageUtil.success('更新成功');
      } else {
        await adminSourceRandomAdd(formData.value);
        MessageUtil.success('添加成功');
      }
      loadData();
      dp.destroy();
    } catch (error) {
      MessageUtil.error(isEdit.value ? '更新失败' : '添加失败');
    } finally {
      submitLoading.value = false;
    }
  };

  const handleCancel = () => {
    dp.destroy();
  };

  const dp = DialogPlugin({
    header: (isEdit.value ? '编辑' : '新增') + '随机源',
    placement: 'center',
    width: "1280px",
    closeOnEscKeydown: false,
    closeOnOverlayClick: false,
    default: () => <div class="flex gap-24px h-500px">
      <div class="flex flex-300 pr-24px overflow-auto" style={{ borderRight: '1px solid var(--td-border-level-2-color)' }}>
        <Form
          data={formData.value}
          rules={formRules}
          label-width="100px"
          onSubmit={handleSubmit}
          layout="vertical"
          class="mt-8px"
        >
          <FormItem label="图标" name="icon">
            <ImageUpload v-model={formData.value.icon} />
          </FormItem>

          <FormItem label="名称" name="name">
            <Input
              v-model={formData.value.name}
              placeholder="请输入随机源名称"
              clearable
            />
          </FormItem>

          <FormItem label="描述" name="description">
            <Textarea
              v-model={formData.value.description}
              placeholder="请输入随机源描述"
              autosize={{ minRows: 3, maxRows: 6 }}
            />
          </FormItem>

          <FormItem label="标签" name="tags">
            <TagInput
              v-model={formData.value.tags}
              placeholder="请输入标签，按回车添加"
              clearable
            />
          </FormItem>
        </Form>
      </div>
      <div class="flex-auto flex flex-col">
        <div
          class="overflow-hidden"
          style={{
            border: '1px solid var(--td-border-level-2-color)',
            borderRadius: 'var(--td-radius-medium)'
          }}
        >
          <MonacoEditor
            v-model={formData.value.script}
            language="javascript"
            height={500}
            options={editorOptions}
          />
        </div>
      </div>
    </div>,
    footer: () => (
      <Space size="small">
        <Button variant="outline" onClick={handleCancel}>
          取消
        </Button >
        <Button theme="primary" onClick={handleSubmit} loading={submitLoading.value}>
          保存
        </Button>
      </Space >
    )
  });
}