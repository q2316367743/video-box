import type {TaskDefinition} from "@/types/Task.ts";
import {adminTaskPreset, adminTaskStop} from "@/apis/admin/task.ts";
import MessageUtil from "@/utils/modal/MessageUtil.ts";
import MessageBoxUtil from "@/utils/modal/MessageBoxUtil.tsx";

export const handleRunTask = async (task: TaskDefinition) => {
  MessageBoxUtil.confirm(`确定要运行任务 "${task.name}" 吗？`, '确认运行任务', {
    confirmButtonText: '运行'
  }).then(async () => {
    try {
      await adminTaskPreset(task.id)
      MessageUtil.success('任务运行成功')
    } catch (error) {
      MessageUtil.error('任务运行失败')
      console.error('任务运行失败:', error)
    } finally {
    }
  })
}

export const handleStopTask = (task: TaskDefinition) => {
  MessageBoxUtil.confirm(`确定要停止任务 "${task.name}" 吗？`, '确认停止任务', {
    confirmButtonText: '运行'
  }).then(async () => {
    try {
      await adminTaskStop(task.id)
      MessageUtil.success('任务停止成功')
    } catch (error) {
      MessageUtil.error('任务停止失败')
      console.error('任务停止失败:', error)
    } finally {
    }
  })
}