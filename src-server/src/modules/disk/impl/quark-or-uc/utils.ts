import axios, {AxiosRequestConfig} from "axios";
import {DiskDriverForQuarkOrUc} from "@/modules/disk/impl/quark-or-uc/driver";
import {getCookie, setCookie, updateFromResponse} from "@/utils/http/CookieUtil";
import {DirCoreItem, DirItem} from "@/modules/disk/DiskPlugin";
import {
  listToDirItems,
  QuarkOrPcListItem,
  QuarkOrUcResult,
  SortRespData,
  SortRespMetadata
} from "@/modules/disk/impl/quark-or-uc/types";
import {basename} from "@/utils/WebPath";
import {SourceDiskDir} from "@/types/SourceDiskDIr";

export async function quarkOrUcRequest<T, M extends Record<string, any> = {}>(pathname: string, method: string, requestConfig: AxiosRequestConfig, driver: DiskDriverForQuarkOrUc) {
  const {config} = driver;
  const rsp = await axios.request<QuarkOrUcResult<T, M>>({
    ...requestConfig,
    baseURL: config.api,
    url: pathname,
    method,
    headers: {
      ...requestConfig.headers,
      "Cookie": driver.props.Cookie,
      "Accept": "application/json, text/plain, */*",
      "Referer": config.referer
    },
    params: {
      ...requestConfig.params,
      pr: config.pr,
      fr: "pc"
    }
  });
  // 更新cookie
  const cookie = updateFromResponse(rsp, driver.props.Cookie);
  const __puus = getCookie(cookie, '__puus');
  if (__puus != null) {
    // 更新cookie
    await driver.updateCookie(setCookie(driver.props.Cookie, '__puus', __puus));
  }
  if (driver.props.UseTransCodingAddress && config.name === 'Quark') {
    const __pus = getCookie(cookie, '__pus');
    if (__pus !== null) {
      await driver.updateCookie(setCookie(driver.props.Cookie, '__pus', __pus));
    }
  }
  // 返回
  const {data} = rsp;
  if (data.status >= 400 || data.code !== 0) {
    return Promise.reject(new Error(data.message));
  }
  return data;
}

export async function quarkOrUcGetFiles(parent: SourceDiskDir, driver: DiskDriverForQuarkOrUc) {
  const {props} = driver;
  let page = 1;
  const size = 100;
  const params: Record<string, any> = {
    pdir_fid: parent.sign || '0',
    _size: size,
    _fetch_total: 1
  }
  if (props.OrderBy !== 'none') {
    params['_sort'] = `file_type:asc,${props.OrderBy}:${props.OrderDirection}`;
  }
  const files = new Array<DirItem>();
  while (true) {
    params['_page'] = page;
    const rsp = await quarkOrUcRequest<SortRespData, SortRespMetadata>('/file/sort', 'GET', {params}, driver);
    const {_total} = rsp.metadata;
    const {list} = rsp.data;


    if (props.OnlyListVideoFile) {
      files.push(...listToDirItems(list.filter(file => (file.category === 1 || !file.file)), parent));
    } else {
      files.push(...listToDirItems(list, parent));
    }

    if (page * size >= _total) break;
    page += 1;
  }
  return files;
}

export async function quarkOrUcDownloadLink(file: DirCoreItem, driver: DiskDriverForQuarkOrUc) {
  const {config} = driver;
  const {sign} = file;
  const rsp = await quarkOrUcRequest<any>('/file/download', 'POST', {
    headers: {
      'User-Agent': config.ua
    },
    data: {
      fids: [sign]
    }
  }, driver);

  return rsp.data[0]?.download_url as string;
}


