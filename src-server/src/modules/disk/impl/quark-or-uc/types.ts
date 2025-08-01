import {DirItem} from "@/modules/disk/DiskPlugin";
import {extname} from "@/utils/WebPath";
import {SourceDiskDir} from "@/types/SourceDiskDIr";

export interface DiskFormQuarkUc {
  Cookie: string;
  RootID: string;
  OrderBy: string;
  OrderDirection: string;
  UseTransCodingAddress: boolean;
  OnlyListVideoFile: boolean;
  AdditionVersion?: number
}

export interface DiskConfigQuarkUc {
  ua: string;
  referer: string;
  api: string;
  pr: string;
  name: string;
  defaultRoot: string;
  onlyProxy: boolean;
  // 不允许覆盖上传
  noOverwriteUpload: boolean;
}

export interface QuarkOrUcResult<T, M> {
  status: number;
  code: number;
  message: string;
  timestamp: number;
  data: T;
  metadata: M;
}

export interface SortRespMetadata {
  _size: number;
  req_id: string;
  _page: number;
  _count: number;
  _total: number;
}

export interface SortRespData {
  last_view_list: any[];
  recent_file_list: any[];
  list: QuarkOrPcListItem[];
}

export interface QuarkOrPcListItem {
  fid: string;
  file_name: string;
  pdir_fid: string;
  category: number;
  file_type: number;
  size: number;
  format_type: string;
  status: number;
  tags: string;
  l_created_at: number;
  l_updated_at: number;
  source: string;
  file_source: string;
  name_space: number;
  l_shot_at: number;
  source_display: string;
  include_items?: number;
  series_dir: boolean;
  album_dir: boolean;
  more_than_one_layer: boolean;
  upload_camera_root_dir: boolean;
  fps: number;
  like: number;
  operated_at: number;
  sort_type?: string;
  sort_range?: string;
  risk_type: number;
  tag_list: any[];
  backup_sign: number;
  file_name_hl_start: number;
  file_name_hl_end: number;
  file_struct: Filestruct;
  duration: number;
  event_extra: Eventextra;
  file_local_path: string;
  scrape_status: number;
  update_view_at: number;
  ban: boolean;
  cur_version_or_default: number;
  save_as_source: boolean;
  backup_source: boolean;
  offline_source: boolean;
  owner_drive_type_or_default: number;
  raw_name_space: number;
  dir: boolean;
  file: boolean;
  created_at: number;
  updated_at: number;
  _extra: Extra;
  obj_category?: string;
  last_play_info?: Lastplayinfo;
  sec_archive_preview?: boolean;
  thumbnail?: string;
  big_thumbnail?: string;
  preview_url?: string;
  apk_info?: Apkinfo;
}

export function listToDirItems(list: QuarkOrPcListItem[], parent: SourceDiskDir): Array<DirItem> {
  const {path} = parent;
  return list.map(item => ({
    type: item.file ? 'file' : 'folder',
    name: item.file_name,
    cover: item.big_thumbnail,
    size: item.size,
    path: `${path === '/' ? '' : path}/${item.file_name}`,
    folder: path,
    lastModified: item.updated_at,
    extname: item.file ? extname(item.file_name) : '',
    sign: item.fid
  }))
}

interface Apkinfo {
  package_name: string;
  version_name: string;
  version_code: string;
  application_label: string;
  application_labels: string;
}

interface Lastplayinfo {
  time: number;
}

interface Extra {
}

interface Eventextra {
  recent_created_at?: number;
  behavior_platform?: string;
  is_open?: boolean;
  doc_progress_platform?: string;
  view_at?: number;
  doc_progress?: string;
}

interface Filestruct {
  fir_source?: string;
  sec_source?: string;
  thi_source?: string;
  platform_source: string;
  upload_mi?: string;
  upload_dm?: string;
}