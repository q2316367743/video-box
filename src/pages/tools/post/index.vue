<template>
  <div class="ai-tool-add-page">

    <!-- 页面内容 -->
    <div class="page-content">
      <!-- 基础信息区域 -->
      <t-card class="info-section" title="基础信息">
        <t-form ref="formRef" :data="formData" :rules="formRules" layout="vertical">
          <t-form-item label="图标" name="icon">
            <t-upload theme="image" accept="image/*" :max="1" :size-limit="{ size: 2, unit: 'MB' }"
              tips="支持上传 jpg、png 格式图片，文件大小不超过 2MB" @success="handleIconUpload">
              <template #file-list-display="{ files }">
                <div v-if="files.length" class="icon-preview">
                  <img :src="files[0].url" alt="图标预览" />
                </div>
              </template>
            </t-upload>
          </t-form-item>
          <t-form-item label="标题" name="title">
            <t-input v-model="formData.title" placeholder="请输入工具标题" />
          </t-form-item>

          <t-form-item label="描述" name="description">
            <t-textarea v-model="formData.description" placeholder="请输入工具描述" :autosize="{ minRows: 3, maxRows: 6 }" />
          </t-form-item>

          <t-form-item label="标签" name="tags">
            <t-tag-input v-model="formData.tags" placeholder="请输入标签，按回车添加" clearable />
          </t-form-item>
        </t-form>
      </t-card>

      <!-- HTML内容编辑区域 -->
      <t-card class="content-section" title="HTML内容">
        <template #actions>
          <t-space>
            <t-button theme="primary" @click="handleRunPreview" :loading="previewing">
              <template #icon>
                <PlayIcon />
              </template>
              运行预览
            </t-button>
            <t-button variant="outline" @click="togglePreview">
              {{ showPreview ? '隐藏预览' : '显示预览' }}
            </t-button>
          </t-space>
        </template>

        <div class="editor-container">
          <div class="monaco-editor-wrapper">
            <div ref="editorRef" class="monaco-editor"></div>
          </div>

          <!-- 预览区域 -->
          <div v-if="showPreview" class="preview-container">
            <div class="preview-header">
              <span>预览效果</span>
              <t-button size="small" variant="text" @click="refreshPreview">
                <template #icon>
                  <RefreshIcon />
                </template>
                刷新
              </t-button>
            </div>
            <iframe ref="previewRef" class="preview-iframe" sandbox="allow-scripts allow-same-origin"
              :srcdoc="previewContent"></iframe>
          </div>
        </div>
      </t-card>
    </div>

    <!-- 底部操作区域 -->
    <div class="page-footer">
      <div class="footer-actions">
        <t-button variant="outline" @click="handleCancel">取消</t-button>
        <t-button theme="primary" @click="handleSave" :loading="saving">保存</t-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { FormInstanceFunctions, TdFormProps } from 'tdesign-vue-next';
import { PlayIcon, RefreshIcon } from 'tdesign-icons-vue-next';
import * as monaco from 'monaco-editor';
import { toolManageAdd, toolManageInfo, toolManageUpdate } from '@/apis/tool/manage';
import type { AiToolPost } from '@/types/AiTool';
import MessageUtil from '@/utils/modal/MessageUtil';
import { openCodeRunnerDrawer } from '../chat/components/CodeRunnerDrawer';
import { isDark } from '@/store';

const route = useRoute();
const router = useRouter();

// 表单数据
const formData = ref<AiToolPost>({
  icon: '',
  title: '',
  description: '',
  tags: [],
  content: ''
});

// 表单验证规则
const formRules: TdFormProps['rules'] = {
  title: [{ required: true, message: '请输入工具标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入HTML内容', trigger: 'blur' }]
};

// 组件状态
const formRef = ref<FormInstanceFunctions>();
const editorRef = ref();
const previewRef = ref();
const saving = ref(false);
const previewing = ref(false);
const showPreview = ref(false);
const previewContent = ref('');

let editor: monaco.editor.IStandaloneCodeEditor | null = null;

// 初始化Monaco编辑器
const initMonacoEditor = async () => {
  if (!editorRef.value) return;

  editor = monaco.editor.create(editorRef.value, {
    value: formData.value.content,
    language: 'html',
    theme: isDark.value ? 'vs-dark' : 'vs-light',
    automaticLayout: true,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    wordWrap: 'on',
    folding: true,
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line',
    glyphMargin: false,
    contextmenu: true,
    mouseWheelZoom: true,
    formatOnPaste: true,
    formatOnType: true,
    autoIndent: 'full',
    tabSize: 2,
    insertSpaces: true
  });

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    formData.value.content = editor?.getValue() || '';
  });
};

// 处理图标上传
const handleIconUpload = (context: any) => {
  if (context.file && context.file.response) {
    formData.value.icon = context.file.response.url;
  }
};

// 运行预览
const handleRunPreview = async () => {
  if (!formData.value.content.trim()) {
    MessageUtil.warning('请先输入HTML内容');
    return;
  }
  openCodeRunnerDrawer(formData.value.content, {
    width: '80vw',
    title: '代码运行器',
    maskClosable: true,
    footer: false
  })

};

// 切换预览显示
const togglePreview = () => {
  showPreview.value = !showPreview.value;
  if (showPreview.value && formData.value.content.trim()) {
    previewContent.value = formData.value.content;
  }
};

// 刷新预览
const refreshPreview = () => {
  if (formData.value.content.trim()) {
    previewContent.value = formData.value.content;
    MessageUtil.success('预览已刷新');
  }
};

// 保存工具
const handleSave = async () => {
  try {
    const valid = await formRef.value?.validate();
    if (!valid) return;

    if (!formData.value.content.trim()) {
      MessageUtil.warning('请输入HTML内容');
      return;
    }

    saving.value = true;
    if (route.params.id === '0') {
      await toolManageAdd(formData.value);
    } else {
      await toolManageUpdate(route.params.id as string, formData.value);
    }
    MessageUtil.success('保存成功');
    router.push('/tools/list');
  } catch (error) {
    MessageUtil.error('保存失败');
  } finally {
    saving.value = false;
  }
};

// 取消操作
const handleCancel = () => {
  router.push('/tools/list');
};

onMounted(() => {
  nextTick(() => {
    initMonacoEditor();
  });
  const { id } = route.params;
  if (id !== '0') {
    toolManageInfo(id as string).then((res) => {
      formData.value = {
        icon: res.icon,
        title: res.title,
        description: res.description,
        tags: res.tags,
        content: res.content
      };
      editor?.setValue(res.content);
    })
  }
});

onUnmounted(() => {
  if (editor) {
    editor.dispose();
  }
});
</script>

<style scoped lang="less">
.ai-tool-add-page {
  min-height: 100vh;
  background-color: var(--td-bg-color-page);
}

.page-content {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.info-section {
  margin-bottom: 24px;

  .icon-preview {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--td-border-level-2-color);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.content-section {
  .editor-toolbar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--td-border-level-2-color);
  }

  .editor-container {
    display: flex;
    gap: 24px;
    height: 800px;

    .monaco-editor-wrapper {
      flex: 1;
      border: 1px solid var(--td-border-level-2-color);
      border-radius: 6px;
      overflow: hidden;

      .monaco-editor {
        height: 100%;
      }
    }

    .preview-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--td-border-level-2-color);
      border-radius: 6px;
      overflow: hidden;

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: var(--td-bg-color-container);
        border-bottom: 1px solid var(--td-border-level-2-color);
        font-size: 14px;
        font-weight: 500;
        color: var(--td-text-color-primary);
      }

      .preview-iframe {
        flex: 1;
        border: none;
        background: var(--td-bg-color-container);
      }
    }
  }
}

.page-footer {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--td-bg-color-container);
  border-top: 1px solid var(--td-border-level-2-color);
  padding: 16px 24px;
  box-shadow: var(--td-shadow-1);
  z-index: 100;

  .footer-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    max-width: 1400px;
    margin: 0 auto;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .content-section .editor-container {
    flex-direction: column;
    height: auto;

    .monaco-editor-wrapper {
      height: 400px;
    }

    .preview-container {
      height: 400px;
    }
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 16px;
    flex-direction: column;
    gap: 16px;
    align-items: stretch;

    .header-actions {
      justify-content: center;
    }
  }

  .page-content {
    padding: 16px;
  }

  .page-footer {
    padding: 12px 16px;

    .footer-actions {
      flex-direction: column;
    }
  }
}
</style>