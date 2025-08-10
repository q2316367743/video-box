import {AxiosError, AxiosRequestConfig, Method} from "axios";
import {DiskDriverForBaiduNetDisk} from "@/modules/disk/impl/baidu-netdisk/driver";
import {info} from "@rasla/logify";
import {promiseRetry} from "@/utils/lang/PromiseUtil";
import {DirItem, DiskFileLink} from "@/modules/disk/DiskPlugin";
import {SourceDiskDir} from "@/types/SourceDiskDIr";
import {
  BaiduNetDiskCreateProps,
  BaiduNetDiskDownloadResp,
  BaiduNetDiskDownloadResp2,
  baiduNetDiskFileToDir,
  BaiduNetDiskListResp, BaiduNetDiskRefreshTokenRsp
} from "@/modules/disk/impl/baidu-netdisk/types";
import {http} from "@/global/http";

async function refreshToken(driver: DiskDriverForBaiduNetDisk) {
  const {props} = driver;
  // 使用在线API刷新Token，无需ClientID和ClientSecret
  if (props.UseOnlineAPI && props.APIAddress.length && props.APIAddress.length > 0) {
    const url = props.APIAddress;
    const {data} = await http.request<BaiduNetDiskRefreshTokenRsp>({
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
    const {data} = await http.request<BaiduNetDiskRefreshTokenRsp>({
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
    const {data} = await http.request<T>({
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

export async function baiduNetDiskPostForm(pathname: string, params: Record<string, any>, data: FormData, driver: DiskDriverForBaiduNetDisk) {
  return baiduNetDiskRequest("https://pan.baidu.com/rest/2.0" + pathname, 'POST', {
    params,
    data
  }, driver)
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
    const listResp = await baiduNetDiskGet<BaiduNetDiskListResp>('/xpan/file', params, driver);
    if (listResp.list.length === 0) break;
    if (props.OnlyListVideoFile) {
      listResp.list.filter(e => e.isdir === 1 || e.category == 1).forEach(e => files.push(baiduNetDiskFileToDir(dir, e)));
    } else {
      listResp.list.forEach(e => files.push(baiduNetDiskFileToDir(dir, e)));
    }
  }

  return files;
}

export async function baiduNetDiskLinkCrack(file: SourceDiskDir, driver: DiskDriverForBaiduNetDisk): Promise<DiskFileLink> {
  const resp = await baiduNetDiskRequest<BaiduNetDiskDownloadResp2>('https://pan.baidu.com/api/filemetas', 'GET', {
    params: {
      target: `["${file.path}"]`,
      "dlink": "1",
      "web": "5",
      "origin": "dlna",
    }
  }, driver);
  return {
    url: resp.info[0].dlink,
    headers: {
      'User-Agent': driver.props.CustomCrackUA
    }
  }
}

export async function baiduNetDiskLinkCrackVideo(file: SourceDiskDir, driver: DiskDriverForBaiduNetDisk): Promise<DiskFileLink> {
  const resp = await baiduNetDiskRequest('https://pan.baidu.com/api/mediainfo', 'GET', {
    params: {
      "type": "VideoURL",
      "path": file.path,
      "fs_id": file.sign,
      "devuid": "0%1",
      "clienttype": "1",
      "channel": "android_15_25010PN30C_bd-netdisk_1523a",
      "nom3u8": "1",
      "dlink": "1",
      "media": "1",
      "origin": "dlna",
    }
  }, driver);
  return {
    url: resp.info.dlink,
    headers: {
      'User-Agent': driver.props.CustomCrackUA
    }
  }
}

export async function baiduNetDiskLinkOfficial(file: SourceDiskDir, driver: DiskDriverForBaiduNetDisk) {
  const resp = await baiduNetDiskGet<BaiduNetDiskDownloadResp>('/xpan/multimedia', {
    method: 'filemetas',
    fsids: `[${file.sign}]`,
    dlink: 1
  }, driver);
  const url = `${resp.list[0].dlink}&access_token=${driver.props.AccessToken}`;
  const res = await http.head(url, {
    headers: {
      'User-Agent': 'pan.baidu.com'
    }
  });
  const u = res.headers['location'];
  return {
    url: u,
    headers: {
      'User-Agent': 'pan.baidu.com'
    }
  }
}

export async function baiduNetDiskCreate(props: BaiduNetDiskCreateProps, driver: DiskDriverForBaiduNetDisk) {
  const {path, size, isdir, uploadid, block_list, mtime, ctime} = props;
  const params: Record<string, any> = {
    "method": "create",
  }
  const form = new FormData();
  form.set('path', path);
  form.set('size', size + '');
  form.set('isdir', isdir + '');
  form.set('rtype', '3');
  if (mtime != 0 && ctime != 0) {
    form.set('local_mtime', mtime + '');
    form.set('local_ctime', ctime + '');
  }

  if (uploadid != "") {
    form.set('uploadid', uploadid);
  }
  if (block_list != "") {
    form.set('block_list', block_list);
  }
  await baiduNetDiskPostForm("/xpan/file", params, form, driver);
}

export async function baiduNetDiskManage(opera: string, filelist: Record<string, any>, driver: DiskDriverForBaiduNetDisk) {
  const formData = new FormData();
  formData.set("async", "0")
  formData.set("filelist", JSON.stringify(filelist))
  formData.set("ondup", "fail")
  return baiduNetDiskPostForm("/xpan/file", {
    "method": "filemanager",
    "opera": opera,
  }, formData, driver)
}
