<template>
  <div ref="editorContainer" class="monaco-editor-container"></div>
</template>

<script setup lang="ts">
import {nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import * as monaco from 'monaco-editor'
import {isDark} from '@/store'

const modelValue = defineModel({
  type: String,
  default: ''
});
const props = defineProps({
  language: {
    type: String,
    default: 'javascript'
  },
  height: {
    type: Object as PropType<number | string>,
    default: 300
  },
  options: {
    type: Object,
    default: () => ({})
  }
});


const editorContainer = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null

const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  fontSize: 14,
  minimap: {enabled: false},
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  insertSpaces: true,
  wordWrap: 'on',
  lineNumbers: 'on',
  glyphMargin: false,
  folding: true,
  lineDecorationsWidth: 10,
  lineNumbersMinChars: 3,
  renderLineHighlight: 'line',
  selectOnLineNumbers: true,
  roundedSelection: false,
  readOnly: false,
  cursorStyle: 'line',
  contextmenu: true
}

const initEditor = async () => {
  if (!editorContainer.value) return

  // 设置容器高度
  if (typeof props.height === 'number') {
    editorContainer.value.style.height = `${props.height}px`
  } else {
    editorContainer.value.style.height = props.height
  }

  // 创建编辑器
  editor = monaco.editor.create(editorContainer.value, {
    ...defaultOptions,
    ...props.options,
    value: modelValue.value,
    language: props.language,
    theme: isDark.value ? 'vs-dark' : 'vs'
  })

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    if (editor) {
      modelValue.value = editor.getValue();
    }
  })

  // 设置JavaScript语言特性
  if (props.language === 'javascript') {
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types']
    })

    // 添加常用的全局变量和函数
    monaco.languages.typescript.javascriptDefaults.addExtraLib(`
      declare const console: {
        log(...args: any[]): void;
        error(...args: any[]): void;
        warn(...args: any[]): void;
        info(...args: any[]): void;
      };
      
      declare const fetch: (url: string, options?: any) => Promise<any>;
      declare const document: any;
      declare const window: any;
      declare const $: any;
      declare const cheerio: any;
    `, 'global.d.ts')
  }
}

const updateValue = (newValue: string) => {
  if (!editor) return;
  if (newValue === editor.getValue()) return;
  editor.setValue(newValue)
}

// 监听props变化
watch(modelValue, updateValue)

watch(() => props.language, (newLanguage) => {
  if (editor) {
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, newLanguage)
    }
  }
})

onMounted(async () => {
  await nextTick()
  await initEditor()
})

onUnmounted(() => {
  if (editor) {
    editor.dispose()
    editor = null
  }
})

// 暴露编辑器实例方法
defineExpose({
  getEditor: () => editor,
  focus: () => editor?.focus(),
  setValue: (value: string) => editor?.setValue(value),
  getValue: () => editor?.getValue() || '',
  insertText: (text: string) => {
    if (editor) {
      const selection = editor.getSelection()
      if (selection) {
        editor.executeEdits('', [{
          range: selection,
          text: text
        }])
      }
    }
  }
})
</script>

<style scoped>
.monaco-editor-container {
  width: 100%;
  min-height: 200px;
  height: 100%;
}
</style>