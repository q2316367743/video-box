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
          <!-- 编辑模式 -->
          <div v-if="editingSessionId === session.id" class="session-edit">
            <t-input
              v-model="editingTitle"
              size="small"
              :loading="renameLoading"
              @keyup.enter="saveRename"
              @keyup.esc="cancelRename"
              @blur="saveRename"
              ref="editInput"
              class="edit-input"
            />
            <div class="edit-actions">
              <t-button size="small" theme="primary" variant="text" @click="saveRename" :loading="renameLoading">
                <template #icon>
                  <check-icon />
                </template>
              </t-button>
              <t-button size="small" theme="default" variant="text" @click="cancelRename">
                <template #icon>
                  <close-icon />
                </template>
              </t-button>
            </div>
          </div>
          <!-- 正常显示模式 -->
          <div v-else class="session-display">
            <div class="session-title">{{ session.title }}</div>
            <div class="session-time">{{ toDateString(session.created_at) }}</div>
          </div>
        </div>
        <div class="session-actions">
          <t-button v-if="editingSessionId !== session.id" size="small" theme="default" variant="text" @click.stop="startRename(session)">
            <template #icon>
              <edit-icon />
            </template>
          </t-button>
          <t-button size="small" theme="danger" variant="text" @click.stop="deleteSession(session)">
            <template #icon>
              <delete-icon />
            </template>
          </t-button>
        </div>
      </div>

      <div v-if="sessionList.length === 0" class="empty-sessions">
        <t-empty description="暂无会话记录" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { AddIcon, DeleteIcon, EditIcon, CheckIcon, CloseIcon } from 'tdesign-icons-vue-next';
import { toolChatDelete, toolChatList, toolChatRename } from '@/apis/tool/chat';
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

// 重命名相关状态
const editingSessionId = ref<string | null>(null);
const editingTitle = ref('');
const renameLoading = ref(false);
const editInput = ref();

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

// 开始重命名
const startRename = (session: AiToolSession) => {
  editingSessionId.value = session.id;
  editingTitle.value = session.title;
  
  // 下一帧聚焦输入框
  nextTick(() => {
    if (editInput.value) {
      editInput.value.focus();
      editInput.value.select();
    }
  });
}

// 保存重命名
const saveRename = async () => {
  if (!editingSessionId.value || !editingTitle.value.trim()) {
    cancelRename();
    return;
  }

  const newTitle = editingTitle.value.trim();
  const currentSession = sessionList.value.find(s => s.id === editingSessionId.value);
  
  // 如果标题没有变化，直接取消编辑
  if (currentSession && newTitle === currentSession.title) {
    cancelRename();
    return;
  }

  try {
    renameLoading.value = true;
    await toolChatRename(editingSessionId.value, newTitle);
    
    // 更新本地数据
    if (currentSession) {
      currentSession.title = newTitle;
    }
    
    MessageUtil.success('重命名成功');
    cancelRename();
  } catch (error) {
    console.error('重命名失败:', error);
    MessageUtil.error('重命名失败');
  } finally {
    renameLoading.value = false;
  }
}

// 取消重命名
const cancelRename = () => {
  editingSessionId.value = null;
  editingTitle.value = '';
  renameLoading.value = false;
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

          .session-display {
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

          .session-edit {
            display: flex;
            align-items: center;
            gap: 8px;

            .edit-input {
              flex: 1;
              min-width: 0;
            }

            .edit-actions {
              display: flex;
              gap: 4px;
              flex-shrink: 0;
            }
          }
        }

        .session-actions {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
        }
      }

    .empty-sessions {
      text-align: center;
      padding: 40px 20px;
    }
  }
}
</style>