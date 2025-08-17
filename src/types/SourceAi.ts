import { YesOrNoType } from "@/global/Constant";

// 驱动 1-openai
export type SourceAiDriver = 1;

export interface SourceAiCore {

  driver: SourceAiDriver;
  name: string;
  description: string;

  url: string;
  token: string;

  is_enabled: YesOrNoType;

}

export interface SourceAi extends SourceAiCore {
  id: string;
  created_at: number;
  updated_at: number;

}

export interface SourceAiModelCore {

  // 模型
  model: string;
  // 所属
  owned: string;

}

export interface SourceAiModel extends SourceAiModelCore {
  id: string;
  created_at: number;
  updated_at: number;

  ai_id: string;

}