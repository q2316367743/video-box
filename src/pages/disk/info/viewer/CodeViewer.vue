<template>
  <div class="code-viewer">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <t-loading size="large" text="正在加载代码文件..." />
    </div>
    
    <!-- 错误状态 -->
    <t-alert v-else-if="error" theme="error" :message="error" class="error-alert" />
    
    <!-- 代码内容 -->
    <div v-else-if="codeContent" class="code-container">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="file-info">
          <span class="filename">{{ name }}</span>
          <span class="language-tag">{{ languageType }}</span>
        </div>
        <div class="toolbar-actions">
          <t-button
            variant="text" 
            size="small" 
            @click="copyCode"
            :loading="copying"
          >
            <template #icon>
              <CopyIcon />
            </template>
            {{ copying ? '复制中...' : '复制代码' }}
          </t-button>
        </div>
      </div>
      
      <!-- 代码显示区域 -->
      <div class="code-display">
        <div class="line-numbers">
          <div 
            v-for="(_line, index) in codeLines"
            :key="index" 
            class="line-number"
          >
            {{ index + 1 }}
          </div>
        </div>
        <div class="code-content">
          <pre><code 
            ref="codeElement" 
            :class="`language-${languageType}`"
            v-html="highlightedCode"
          ></code></pre>
        </div>
      </div>
      <t-back-top container=".code-content" :offset='["48px", "80px"]'/>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-content">
        <FileIcon class="empty-icon" />
        <p>暂无代码内容</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {CopyIcon, FileIcon} from 'tdesign-icons-vue-next'
import hljs from 'highlight.js'
import MessageUtil from "@/utils/modal/MessageUtil.ts";

// Props 接口定义
interface Props {
  url: string
  name: string
  extname: string
}

const props = withDefaults(defineProps<Props>(), {
  url: '',
  name: '',
  extname: ''
})

// 响应式数据
const loading = ref(false)
const error = ref('')
const codeContent = ref('')
const copying = ref(false)
const codeElement = ref<HTMLElement>()

// 计算属性
const languageType = computed(() => {
  return getLanguageFromExtension(props.extname)
})

const codeLines = computed(() => {
  return codeContent.value.split('\n')
})

const highlightedCode = computed(() => {
  if (!codeContent.value) return ''
  
  try {
    const language = languageType.value
    if (hljs.getLanguage(language)) {
      return hljs.highlight(codeContent.value, { language }).value
    } else {
      return hljs.highlightAuto(codeContent.value).value
    }
  } catch (err) {
    console.error('代码高亮失败:', err)
    return codeContent.value
  }
})

// 方法定义
const getLanguageFromExtension = (ext: string): string => {
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'jsx': 'javascript',
    'tsx': 'typescript',
    'vue': 'vue',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'json': 'json',
    'xml': 'xml',
    'md': 'markdown',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'sh': 'bash',
    'sql': 'sql',
    'yaml': 'yaml',
    'yml': 'yaml'
  }
  
  const cleanExt = ext.toLowerCase().replace('.', '')
  return languageMap[cleanExt] || 'plaintext'
}

const fetchCodeContent = async () => {
  if (!props.url) {
    error.value = '文件URL不能为空'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch(props.url)
    
    if (!response.ok) {
      return MessageUtil.error(`HTTP ${response.status}: ${response.statusText}`)
    }

    codeContent.value = await response.text()
    
    // 等待DOM更新后应用高亮
    await nextTick()
    
  } catch (err) {
    console.error('获取代码文件失败:', err)
    error.value = err instanceof Error ? err.message : '获取代码文件失败'
  } finally {
    loading.value = false
  }
}

const copyCode = async () => {
  if (!codeContent.value) return
  
  copying.value = true
  
  try {
    await navigator.clipboard.writeText(codeContent.value)
    MessageUtil.success('代码已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    MessageUtil.error('复制失败，请手动选择复制')
  } finally {
    copying.value = false
  }
}

// 监听props变化
watch(
  () => [props.url, props.extname],
  () => {
    if (props.url) {
      fetchCodeContent()
    }
  },
  { immediate: true }
)

// 组件挂载时初始化
onMounted(() => {
  if (props.url) {
    fetchCodeContent()
  }
})
</script>

<style lang="less" scoped>
.code-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-default);
  border: 1px solid var(--td-border-level-1-color);
  overflow: hidden;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 40px;
}

.error-alert {
  margin: 16px;
}

.code-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background: var(--td-bg-color-component);
  border-bottom: 1px solid var(--td-border-level-1-color);
  min-height: 48px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filename {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
}

.language-tag {
  padding: 2px 8px;
  background: var(--td-brand-color-light);
  color: var(--td-brand-color);
  border-radius: var(--td-radius-small);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.code-display {
  display: flex;
  flex: 1;
  overflow: hidden;
  background: #1e1e1e;
}

.line-numbers {
  display: flex;
  flex-direction: column;
  background: #2d2d2d;
  border-right: 1px solid #404040;
  padding: 16px 8px;
  min-width: 60px;
  user-select: none;
}

.line-number {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #858585;
  text-align: right;
  padding-right: 8px;
}

.code-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.code-content pre {
  margin: 0;
  padding: 0;
  background: transparent;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #d4d4d4;
  white-space: pre;
  word-wrap: normal;
  overflow-x: auto;
}

.code-content code {
  font-family: inherit;
  font-size: inherit;
  background: transparent;
  padding: 0;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 40px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--td-text-color-placeholder);
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.empty-content p {
  margin: 0;
  font-size: 16px;
}

/* highlight.js 主题样式 */
:deep(.hljs) {
  background: transparent !important;
  color: #d4d4d4;
}

:deep(.hljs-keyword) {
  color: #569cd6;
}

:deep(.hljs-string) {
  color: #ce9178;
}

:deep(.hljs-comment) {
  color: #6a9955;
  font-style: italic;
}

:deep(.hljs-number) {
  color: #b5cea8;
}

:deep(.hljs-function) {
  color: #dcdcaa;
}

:deep(.hljs-variable) {
  color: #9cdcfe;
}

:deep(.hljs-type) {
  color: #4ec9b0;
}

:deep(.hljs-attr) {
  color: #92c5f8;
}

:deep(.hljs-tag) {
  color: #569cd6;
}

:deep(.hljs-name) {
  color: #4fc1ff;
}

:deep(.hljs-attribute) {
  color: #9cdcfe;
}
</style>