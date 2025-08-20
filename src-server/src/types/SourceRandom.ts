export interface SourceRandom {
  id: string;
  created_at: number;
  updated_at: number;
  is_enabled: number;

  icon: string;
  name: string;
  description: string;
  // 逗号分割的标签
  tags: string;

}

export interface SourceRandomContent {
  id: string;
  random_id: string;

  script: string;
}
export interface SourceRandomRecord {
  title: string;
  url: string;
  desc?: string;
}

export type SourceRandomRecordType = string | SourceRandomRecord;