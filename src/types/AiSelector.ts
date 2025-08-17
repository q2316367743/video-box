import { SourceAi, SourceAiModel } from './SourceAi'

// AI选择器相关的类型定义

// AI服务选择项
export interface AiServiceOption {
  id: string
  name: string
  description: string
  driver: number
  isEnabled: boolean
  icon?: string
}

// 模型选择项
export interface AiModelOption {
  id: string
  model: string
  owned: string
  aiId: string
  displayName?: string
  description?: string
}

// 选择器状态
export interface AiSelectorState {
  selectedAiId: string | null
  selectedModel: string | null
  availableAiServices: Array<AiServiceOption>;
  availableModels: Array<AiModelOption>;
  isLoadingServices: boolean
  isLoadingModels: boolean
}

// 用户选择偏好（用于本地存储）
export interface AiSelectorPreference {
  lastSelectedAiId: string | null
  lastSelectedModel: string | null
  timestamp: number
}

// 选择器配置
export interface AiSelectorConfig {
  showDescription: boolean
  enableSearch: boolean
  autoSelectFirst: boolean
  storageKey: string
}

// 选择器事件
export interface AiSelectorEvents {
  onAiServiceChange: (aiId: string) => void
  onModelChange: (model: string) => void
  onError: (error: Error) => void
}

// 转换函数的类型定义
export type SourceAiToOption = (sourceAi: SourceAi) => AiServiceOption
export type SourceAiModelToOption = (sourceAiModel: SourceAiModel) => AiModelOption