
export interface CmsHomeResult {
  code: number;
  msg: string;
  page: number;
  pagecount: number;
  limit: number;
  total: number;
  list: CmsHomeList[];
  class: CmsHomeClass[];
}

export interface CmsHomeClass {
  type_id: number;
  type_pid?: number;
  type_name: string;
}

interface CmsHomeList {
  vod_id: number;
  vod_name: string;
  type_id: number;
  type_name: string;
  vod_en: string;
  vod_time: string;
  vod_remarks: string;
  vod_play_from: string;
}

export interface CmsVideoList {
  code: number;
  msg: string;
  page: number;
  pagecount: number;
  limit: string;
  total: number;
  list: CmsVideoListItem[] | null;
}

interface CmsVideoListItem {
  vod_id: number;
  type_id: number;
  type_id_1: number;
  group_id: number;
  vod_name: string;
  vod_sub: string;
  vod_en: string;
  vod_status: number;
  vod_letter: string;
  vod_color: string;
  vod_tag: string;
  vod_class: string;
  vod_pic: string;
  vod_pic_thumb: string;
  vod_pic_slide: string;
  vod_pic_screenshot: string;
  vod_actor: string;
  vod_director: string;
  vod_writer: string;
  vod_behind: string;
  vod_blurb: string;
  vod_remarks: string;
  vod_pubdate: string;
  vod_total: number;
  vod_serial: string;
  vod_tv: string;
  vod_weekday: string;
  vod_area: string;
  vod_lang: string;
  vod_year: string;
  vod_version: string;
  vod_state: string;
  vod_author: string;
  vod_jumpurl: string;
  vod_tpl: string;
  vod_tpl_play: string;
  vod_tpl_down: string;
  vod_isend: number;
  vod_lock: number;
  vod_level: number;
  vod_copyright: number;
  vod_points: number;
  vod_points_play: number;
  vod_points_down: number;
  vod_hits: number;
  vod_hits_day: number;
  vod_hits_week: number;
  vod_hits_month: number;
  vod_duration: string;
  vod_up: number;
  vod_down: number;
  vod_score: string;
  vod_score_all: number;
  vod_score_num: number;
  vod_time: string;
  vod_time_add: number;
  vod_time_hits: number;
  vod_time_make: number;
  vod_trysee: number;
  vod_douban_id: number;
  vod_douban_score: string;
  vod_reurl: string;
  vod_rel_vod: string;
  vod_rel_art: string;
  vod_pwd: string;
  vod_pwd_url: string;
  vod_pwd_play: string;
  vod_pwd_play_url: string;
  vod_pwd_down: string;
  vod_pwd_down_url: string;
  vod_content: string;
  vod_play_from: string;
  vod_play_server: string;
  vod_play_note: string;
  vod_play_url: string;
  vod_down_from: string;
  vod_down_server: string;
  vod_down_note: string;
  vod_down_url: string;
  vod_plot: number;
  vod_plot_name: string;
  vod_plot_detail: string;
  type_name: string;
}