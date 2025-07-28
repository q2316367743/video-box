export interface SettingForm {
  key: string;
  value: any;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  create_time: number;
  update_time: number;
}