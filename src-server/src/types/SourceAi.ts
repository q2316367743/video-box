import {YesOrNoType} from "@/global/constant";

// 驱动 1-openai
export type SourceAiDriver = 1;

export interface SourceAi {
  id: string;
  created_at: number;
  updated_at: number;
  driver: SourceAiDriver;

  name: string;
  description: string;

  url: string;
  token: string;

  is_enabled: YesOrNoType;

}

export interface SourceAiModel {
  id: string;
  created_at: number;
  updated_at: number;

  ai_id: string;

  // 模型
  model: string;
  // 所属
  owned: string;

}