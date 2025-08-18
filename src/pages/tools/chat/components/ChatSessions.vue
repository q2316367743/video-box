<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h3>会话列表</h3>
      <t-button size="small" theme="primary" @click="createNewSession">
        <template #icon>
          <add-icon />
        </template>
        新建会话
      </t-button>
    </div>

    <div class="session-list">
      <div v-for="session in sessionList" :key="session.id"
        :class="['session-item', { active: sessionId === session.id }]" @click="switchSession(session)">
        <div class="session-info">
          <div class="session-title">{{ session.title }}</div>
          <div class="session-time">{{ toDateString(session.created_at) }}</div>
        </div>
        <t-button size="small" theme="danger" variant="text" @click.stop="deleteSession(session)">
          <template #icon>
            <delete-icon />
          </template>
        </t-button>
      </div>

      <div v-if="sessionList.length === 0" class="empty-sessions">
        <t-empty description="暂无会话记录" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { AddIcon, DeleteIcon } from 'tdesign-icons-vue-next';
import { toolChatDelete, toolChatList } from '@/apis/tool/chat';
import { AiToolSession } from '@/types/AiTool';
import { toDateString } from '@/utils/lang/FormatUtil';
import MessageBoxUtil from '@/utils/modal/MessageBoxUtil';
import MessageUtil from '@/utils/modal/MessageUtil';

const sessionId = defineModel({
  type: String,
  default: null,
});
const emit = defineEmits(['change'])


const sessionList = ref<AiToolSession[]>([]);

const loadSessionList = async () => {
  try {
    const response = await toolChatList()
    sessionList.value = response || []
  } catch (error) {
    console.error('加载会话列表失败:', error)
    MessageUtil.error('加载会话列表失败')
  }
}


const switchSession = async (session: AiToolSession | null) => {
  const target = session ? session.id : '';
  sessionId.value = target
  emit('change', target);
}

const createNewSession = () => {
  switchSession(null);
}

// 删除会话
const deleteSession = async (session: AiToolSession) => {
  try {
    await MessageBoxUtil.alert('确定要删除这个会话吗？', '删除会话', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })

    await toolChatDelete(session.id)
    await loadSessionList()

    // 如果删除的是当前会话，切换到第一个会话
    if (sessionId.value === session.id) {
      if (sessionList.value.length > 0) {
        await switchSession(sessionList.value[0])
      } else {
        await switchSession(null);
      }
    }

    MessageUtil.success('删除会话成功')
  } catch (error) {
    console.error('删除会话失败:', error)
    MessageUtil.error('删除会话失败')
  }
}


onMounted(async () => {
  await loadSessionList()
});
defineExpose({ loadSessionList })
</script>
<style scoped lang="less">
// 左侧会话列表
.sidebar {
  width: 300px;
  background: var(--td-bg-color-container);
  border-right: 1px solid var(--td-border-level-1-color);
  display: flex;
  flex-direction: column;

  .sidebar-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--td-border-level-1-color);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      color: var(--td-text-color-primary);
      font-size: 16px;
    }
  }

  .session-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px;

    .session-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s;
      margin-bottom: 8px;
      border: 1px solid transparent;

      &:hover {
        background-color: var(--td-bg-color-container-hover);
      }

      &.active {
        background-color: var(--td-brand-color-light);
        border: 1px solid var(--td-brand-color);
      }

      .session-info {
        flex: 1;
        min-width: 0;

        .session-title {
          font-weight: 500;
          color: var(--td-text-color-primary);
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .session-time {
          font-size: 12px;
          color: var(--td-text-color-placeholder);
        }
      }
    }

    .empty-sessions {
      text-align: center;
      padding: 40px 20px;
    }
  }
}
</style>