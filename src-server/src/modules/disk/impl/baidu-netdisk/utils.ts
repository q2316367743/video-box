import axios, {AxiosError, AxiosRequestConfig, Method} from "axios";
import {DiskDriverForBaiduNetDisk} from "@/modules/disk/impl/baidu-netdisk/driver";
import {info} from "@rasla/logify";
import {promiseRetry} from "@/utils/lang/PromiseUtil";
import {DirItem} from "@/modules/disk/DiskPlugin";

interface RefreshTokenRsp {
  refresh_token: string;
  access_token: string;
  text: string;
}

async function refreshToken(driver: DiskDriverForBaiduNetDisk) {
  const {props} = driver;
  // 使用在线API刷新Token，无需ClientID和ClientSecret
  if (props.UseOnlineAPI && props.APIAddress.length && props.APIAddress.length > 0) {
    const url = props.APIAddress;
    const {data} = await axios.request<RefreshTokenRsp>({
      headers: {
        'User-Agent': "Mozilla/5.0 (Macintosh; Apple macOS 15_5) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/138.0.0.0 Openlist/425.6.30",
      },
      params: {
        refresh_ui: props.RefreshToken,
        server_use: true,
        driver_txt: "baiduyun_go"
      },
      method: 'GET',
      url,
    });
    if (data.refresh_token === '' || data.access_token === '') {
      if (data.text !== '') {
        return Promise.reject(new Error(`failed to refresh token: ${data.text}`));
      }
      return Promise.reject(new Error('empty token returned from official API, a wrong refresh token may have been used'));
    }
    await driver.updateData({
      ...props,
      AccessToken: data.access_token,
      RefreshToken: data.refresh_token
    });
  }
  // 使用本地客户端的情况下检查是否为空
  if (!props.ClientID || props.ClientID === '' || !props.ClientSecret || props.ClientSecret === '') {
    return Promise.reject(new Error('client id and client secret cannot be empty'));
  }
  // 走原有的刷新逻辑
  try {
    const {data} = await axios.request<RefreshTokenRsp>({
      url: "https://openapi.baidu.com/oauth/2.0/token",
      method: 'GET',
      params: {
        "grant_type": "refresh_token",
        "refresh_token": props.RefreshToken,
        "client_id": props.ClientID,
        "client_secret": props.ClientSecret,
      }
    });
    await driver.updateData({
      ...props,
      AccessToken: data.access_token,
      RefreshToken: data.refresh_token
    });
  } catch (e) {
    if (e instanceof AxiosError) {
      if (e.response) {
        return Promise.reject(`${e.response.data.error}: ${e.response.data.error_description}`)
      }
    }
    return Promise.reject(e);
  }
}

export async function baiduNetDiskRequest<T extends Record<string, any>>(
  url: string, method: Method, config: AxiosRequestConfig, driver: DiskDriverForBaiduNetDisk) {
  return promiseRetry<T>(async () => {
    const {data} = await axios.request<T>({
      ...config,
      url,
      method,
      params: {
        ...config.params,
        'access_token': driver.props.AccessToken,
      },
    });
    const {errno} = data;
    if (errno !== 0) {
      if (errno === 111 || errno === -6) {
        // 刷新token
        info("刷新百度网盘token");
        await refreshToken(driver);

      }
      if (31023 == errno && driver.props.DownloadAPI == "crack_video") {
        return data
      }
      return Promise.reject(new Error(`"req: [${url}] ,errno: ${errno}, refer to https://pan.baidu.com/union/doc/"`))
    }
    return data;
  }, {
    attempts: 3,
    delay: 1000
  })
}

export async function baiduNetDiskGet<T extends Record<string, any>>(pathname: string, params: Record<string, any>, driver: DiskDriverForBaiduNetDisk) {
  return baiduNetDiskRequest<T>("https://pan.baidu.com/rest/2.0" + pathname, 'get', params, driver)
}

interface FileResp {
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

interface ListResp {
  errno: number;
  guid_info: string;
  request_id: number;
  guid: number;
  list: Array<FileResp>
}

function fileToDir(folder: string, file: FileResp): DirItem {
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

export async function baiduNetDiskGetFiles(dir: string, driver: DiskDriverForBaiduNetDisk): Promise<Array<DirItem>> {
  const {props} = driver;
  let start = 0;
  const limit = 200;
  const params: Record<string, any> = {
    method: 'list',
    dir: dir,
    web: 'wen'
  };
  if (props.OrderBy && props.OrderBy !== '') {
    params['order'] = props.OrderBy;
    if (props.OrderDirection === 'desc') {
      params['desc'] = '1';
    }
  }
  const files = new Array<DirItem>();
  while (true) {
    params['start'] = start;
    params['limit'] = limit;
    start += limit;
    const listResp = await baiduNetDiskGet<ListResp>('/xpan/file', params, driver);
    if (listResp.list.length === 0) break;
    if (props.OnlyListVideoFile) {
      listResp.list.filter(e => e.isdir === 1 || e.category == 1).forEach(e => files.push(fileToDir(dir, e)));
    } else {
      listResp.list.forEach(e => files.push(fileToDir(dir, e)));
    }
  }

  return files;
}