<template>
  <t-loading :loading style="min-height: 200px" text="正在加载中">
    <div class="code-preview">
      <div class="code-preview-content" v-html="text"/>
    </div>
  </t-loading>
</template>
<script lang="ts" setup>
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'
import {isDark} from "@/store";
import { DirItem } from '@/apis/plugin/disk/list';
import { useUserStore } from '@/store/UserStore';

const props = defineProps({
  current: {
    type: Object as PropType<DirItem>,
    required: true
  },
  sourceId: {
    type: String,
    required: true
  }
});
const loading = ref(false);
const text = computedAsync(async () => {
  const url = useUserStore().getDiskUrl(props.sourceId, props.current.path)
  loading.value = true;
  return fetch(url).then(res => res.text())
    .then(text => {
      const ext = props.current.extname || '';
      const language: string = ext === 'ts' ? 'typescript' :
        ext === 'js' ? 'javascript' :
          ext === 'py' ? 'python' :
            ext === 'md' ? 'markdown' :
              ext === 'sh' || ext === 'bash' || ext === 'zsh' ? 'bash' :
                ext;
      try {
        return hljs.highlight(text, {language}).value
      } catch (e) {
        return hljs.highlightAuto(text).value
      }
    }).finally(() => loading.value = false);
});
watchEffect(() => {
  if (isDark.value) {
    import('highlight.js/styles/github-dark.css')
  } else {
    import('highlight.js/styles/github.css')
  }
})
</script>
<style scoped lang="less">
.code-preview {
  padding: var(--td-pop-padding-xl);
  font-family: Consolas, serif;

  .code-preview-content {
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>
