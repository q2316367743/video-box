export interface AiTool {
  id: string;
  created_at: number;
  updated_at: number;

  icon: string;
  title: string;
  description: string;
  // 标签，数组
  tags: string;

  is_liked: number;
  run_count: number;
}

export interface AiToolContent {
  id: string;
  created_at: number;
  updated_at: number;

  // 内容
  content: string;

}

export interface AiToolSessionCore {

  title: string;

  // 使用的AI
  ai_id: string;
  // 使用的模型
  ai_model: string;
}

export interface AiToolSession extends AiToolSessionCore {
  id: string;
  created_at: number;
  updated_at: number;

}

export type AiToolMessageRole = 'user' | 'assistant' | 'code' | 'preview';

export interface AiToolMessage {
  id: string;
  created_at: number;

  // 会话ID
  session_id: string;
  role: AiToolMessageRole;

  content: string

}