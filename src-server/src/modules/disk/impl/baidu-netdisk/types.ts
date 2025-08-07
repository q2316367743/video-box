import {DirItem} from "@/modules/disk/DiskPlugin";

export interface BaiduNetDiskRefreshTokenRsp {
  refresh_token: string;
  access_token: string;
  text: string;
}

export interface BaiduNetDiskFileResp {
  // tkbind_id: number;
  // owner_type: number;
  category: number
  // real_category: string;
  fs_id: number;
  // oper_id: number;
  thumbs: {
    // icon: string;
    // url1: string;
    // url2: string;
    url3: string;
  };
  // wpfile: number;
  size: number;
  // extent_tinyint7: number;
  path: string;
  // share: number;
  // pl: number;
  server_filename: string;
  md5: string;
  // owner_id: number;
  // unlist: number;
  isdir: number;
  server_ctime: number;
  server_mtime: number;
  local_mtime: number;
  local_ctime: number;
  // server_atime: number;
  ctime: number;
  mtime: number;
}

export interface BaiduNetDiskListResp {
  errno: number;
  guid_info: string;
  request_id: number;
  guid: number;
  list: Array<BaiduNetDiskFileResp>
}

export function baiduNetDiskFileToDir(folder: string, file: BaiduNetDiskFileResp): DirItem {
  return {
    name: file.server_filename,
    type: file.isdir === 1 ? 'folder' : 'file',
    folder: folder,
    size: file.size,
    lastModified: file.server_mtime,
    extname: file.server_filename.split('.').pop(),
    expands: file,
    cover: file.thumbs.url3,
    path: file.path,
    sign: String(file.fs_id)
  }
}

export interface BaiduNetDiskDownloadResp2 {
  errno: number;
  errmsg: string;
  info: Array<{
    // category: number;
    // filename: string;
    dlink: string;
  }>;
  request_id: number;
}

export interface BaiduNetDiskDownloadResp  {
  errmsg: string;
  errno: number;
  request_id: string;
  list: Array<{
    dlink: string;
  }>
}


export interface BaiduNetDiskCreateProps {
  path: string,
  size: number,
  isdir: number,
  uploadid: string,
  block_list: string,
  mtime: number,
  ctime: number;
}
