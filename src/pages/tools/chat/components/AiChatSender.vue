<template>
  <div class="chat-input">
    <div class="input-container">
      <t-textarea v-model="inputMessage" :autosize="{ minRows: 3, maxRows: 6 }" placeholder="输入你的问题..."
        @enter="sendMessage" :disabled="isTyping" />
      <div class="input-bottom">
        <!-- AI选择器 -->
        <t-space size="small">
          <t-select v-model="aiService" :options="serviceOptions" filterable clearable />
          <t-select v-model="aiModel" :options="modelOptions" filterable clearable />
        </t-space>
        <div class="input-actions">
          <t-button theme="primary" @click="sendMessage" :loading="isTyping"
            :disabled="!inputMessage.trim() || isTyping">
            <template #icon>
              <send-icon />
            </template>
            发送 (Ctrl+Enter)
          </t-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { SelectOption } from 'tdesign-vue-next';
import { SendIcon } from 'tdesign-icons-vue-next';
import { adminSourceAiList, adminSourceAModels } from '@/apis/admin/source/ai';

const props = defineProps({
  isTyping: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send']);

const inputMessage = ref('');

const aiService = useLocalStorage<string>('/tool/ai/service', '');
const aiModel = useLocalStorage<string>('/tool/ai/model', '');

const serviceOptions = ref<Array<SelectOption>>([]);
const modelOptions = computedAsync(async () => {
  if (!aiService.value) return [];
  const list = await adminSourceAModels(aiService.value);
  return list.map(r => ({
    label: r.model,
    value: r.model,
  }))
});

const sendMessage = () => {
  emit('send', {
    message: inputMessage.value,
    ai_id: aiService.value,
    ai_model: aiModel.value
  });
  inputMessage.value = '';
}

onMounted(() => {
  adminSourceAiList().then(res => {
    serviceOptions.value = res.filter(e => e.is_enabled !== 0).map(e => ({
      label: e.name,
      value: e.id,
    }))
  });
})
</script>
<style scoped lang="less">
.chat-input {
  background: var(--td-bg-color-container);
  border-top: 1px solid var(--td-border-level-1-color);
  padding: 16px 20px;

  .input-container {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .input-bottom {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 16px;

      .ai-selector-wrapper {
        flex-shrink: 0;
      }

      .input-actions {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>