<template>
  <div class="chat-container">
    <!-- 左侧会话列表 -->
    <chat-sessions v-model="sessionId" ref="chatSessionsRef" @change="loadMessage" />

    <!-- 右侧聊天区域 -->
    <div class="chat-main">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="chat-title">
          <h3>{{ 'AI 助手' }}</h3>
        </div>
      </div>

      <!-- 聊天消息区域 -->
      <div class="chat-messages" ref="messagesContainer">
        <div v-if="messages.length === 0" class="empty-chat">
          <t-empty description="开始你的第一次对话吧！" />
        </div>

        <chat-message
          v-for="message in messages"
          :key="message.id"
          :content="message.content"
          :is-user="message.role === 'user'"
          :timestamp="message.created_at"
        />

        <!-- 正在输入指示器 -->
        <div v-if="isTyping" class="message-item">
          <div class="message assistant-message">
            <div class="message-avatar">
              <t-avatar size="32px" style="background-color: var(--td-brand-color);">
                <template #icon>
                  <logo-github-icon />
                </template>
              </t-avatar>
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <ai-chat-sender :is-typing="isTyping" @send="sendMessage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  LogoGithubIcon,
} from 'tdesign-icons-vue-next'
import {
  toolChatCreate,
  toolChatMessageList,
} from '@/apis/tool/chat'
import { useUserStore } from '@/store/UserStore'
import type { AiToolMessage } from '@/types/AiTool'
import MessageUtil from '@/utils/modal/MessageUtil'
import AiChatSender from './components/AiChatSender.vue'
import ChatSessions from './components/ChatSessions.vue'
import ChatMessage from './components/ChatMessage.vue'

// 响应式数据
const sessionId = ref('');
const messages = ref<AiToolMessage[]>([])
const isTyping = ref(false)
const messagesContainer = ref<HTMLElement>()

const chatSessionsRef = ref()

// 用户store
const userStore = useUserStore()

// 监听当前会话变化，滚动到底部
watch(() => messages.value.length, () => {
  nextTick(() => {
    scrollToBottom()
  })
});

const loadMessage = async (val: string) => {
  if (!val) {
    messages.value = [];
    return;
  }
  messages.value = await toolChatMessageList(val);
}


// 发送消息
const sendMessage = async (props: { message: string, ai_id: string, ai_model: string }) => {

  const { message, ai_id, ai_model } = props;

  if (sessionId.value === '') {
    sessionId.value = await toolChatCreate({
      title: message.substring(0, 9),
      ai_id,
      ai_model
    });
    // 刷新列表
    chatSessionsRef.value?.loadSessionList();
    messages.value = [];
  }

  // 添加用户消息到界面
  const userMsg: AiToolMessage = {
    id: Date.now().toString(),
    created_at: Date.now(),
    session_id: sessionId.value,
    role: 'user',
    content: message
  }
  messages.value.push(userMsg)

  isTyping.value = true

  try {
    // 使用SSE接收流式响应
    const u = new URL(`${location.origin}/api/tool/chat/stream/${sessionId.value}`);
    u.searchParams.append('authorization', userStore.token);
    u.searchParams.append('ai_id', ai_id)
    u.searchParams.append('ai_model', ai_model)
    u.searchParams.append('content', message)
    const eventSource = new EventSource(u.toString());

    let assistantMessage: AiToolMessage = {
      id: (Date.now() + 1).toString(),
      created_at: Date.now(),
      session_id: sessionId.value,
      role: 'assistant',
      content: ''
    }

    messages.value.push(assistantMessage)


    eventSource.addEventListener('data', event => {
      try {
        const { data } = event;

        // 更新助手消息内容
        assistantMessage.content += data;

      } catch (error) {
        console.error('解析SSE数据失败:', error)
      }
    });


    eventSource.onerror = (error) => {
      console.error('SSE连接错误:', error)
      eventSource.close()
      isTyping.value = false
      MessageUtil.error('连接中断，请重试')
    }

    // 设置超时
    setTimeout(() => {
      if (eventSource.readyState !== EventSource.CLOSED) {
        eventSource.close()
        isTyping.value = false
        MessageUtil.error('请求超时')
      }
    }, 60000) // 60秒超时

  } catch (error) {
    console.error('发送消息失败:', error)
    isTyping.value = false
    MessageUtil.error('发送消息失败')
  }
}


// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}
</script>

<style scoped lang="less">
.chat-container {
  height: 100%;
  display: flex;
  background-color: var(--td-bg-color-page);
}



// 右侧聊天区域
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;

  .chat-header {
    background: var(--td-bg-color-container);
    border-bottom: 1px solid var(--td-border-level-1-color);
    padding: 16px 20px;

    .chat-title {
      h3 {
        margin: 0;
        color: var(--td-text-color-primary);
      }
    }
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;

    .empty-chat {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

  }

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
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--td-brand-color);
    animation: typing 1.4s infinite ease-in-out;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes typing {

  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid var(--td-border-level-1-color);
  }

  .chat-main {
    .chat-messages {
      padding: 12px;

      .message-item .message {
        &.user-message .message-content {
          margin-left: 40px;
        }

        &.assistant-message .message-content {
          margin-right: 40px;
        }
      }
    }

    .chat-input {
      padding: 12px;
    }
  }
}
</style>