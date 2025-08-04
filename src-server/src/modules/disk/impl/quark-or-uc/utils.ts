import axios, {AxiosRequestConfig, Method} from "axios";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import * as crypto from "node:crypto";
import {DiskDriverForQuarkOrUc} from "@/modules/disk/impl/quark-or-uc/driver";
import {getCookie, setCookie, updateFromResponse} from "@/utils/http/CookieUtil";
import {DirCoreItem, DirItem, DiskUploadOption} from "@/modules/disk/DiskPlugin";
import {
  listToDirItems,
  QuarkOrUcResult,
  SortRespData,
  SortRespMetadata, UpAuthRespData, UpHashRespData, UpPreRespData, UpPreRespMeta
} from "@/modules/disk/impl/quark-or-uc/types";
import {SourceDiskDir} from "@/types/SourceDiskDIr";

dayjs.extend(utc);

export async function quarkOrUcRequest<T, M extends Record<string, any> = {}>(pathname: string, method: Method, requestConfig: AxiosRequestConfig, driver: DiskDriverForQuarkOrUc) {
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

export async function quarkOrUcUpPre(folder: SourceDiskDir, option: DiskUploadOption, driver: DiskDriverForQuarkOrUc) {
  const now = Date.now();
  return quarkOrUcRequest<UpPreRespData, UpPreRespMeta>('/file/upload/pre', 'POST', {
    data: {
      "ccp_hash_update": true,
      "dir_name": "",
      "file_name": option.filename,
      "format_type": option.contentType,
      "l_created_at": now,
      "l_updated_at": now,
      "pdir_fid": folder.sign,
      "size": option.contentLength,
      //"same_path_reuse": true,
    }
  }, driver);
}

export async function quarkOrUcUpHash(taskId: string, option: DiskUploadOption, driver: DiskDriverForQuarkOrUc) {
  return quarkOrUcRequest<UpHashRespData, any>('/file/update/hash', 'POST', {
    data: {
      md5: option.md5,
      sha1: option.sha1,
      task_id: taskId
    }
  }, driver);
}

export async function quarkOrUcUpPart(pre: UpPreRespData, mineType: string, partNumber: number, chunk: Uint8Array, driver: DiskDriverForQuarkOrUc) {
  const timeStr = dayjs().format("ddd, DD MMM YYYY HH:mm:ss [GMT]");
  const resp = await quarkOrUcRequest<UpAuthRespData, any>("/file/upload/auth", 'POST', {
    data: {
      "auth_info": pre.auth_info,
      "auth_meta": `PUT

${mineType}
${timeStr}
x-oss-date:${timeStr}
x-oss-user-agent:aliyun-sdk-js/6.6.1 Chrome 98.0.4758.80 on Windows 10 64-bit
/${pre.bucket}/${pre.obj_key}?partNumber=${partNumber}&uploadId=${pre.upload_id}`,
      "task_id": pre.task_id
    },
  }, driver);
  const u = new URL(`https://${pre.bucket}.${pre.upload_url.substring(7)}/${pre.obj_key}`);
  u.searchParams.set("partNumber", String(partNumber));
  u.searchParams.set("uploadId", pre.upload_id);
  const rsp = await fetch(u, {
    method: 'PUT',
    headers: {
      Authorization: resp.data.auth_key,
      'Content-Type': mineType,
      'Referer': 'https://pan.quarl.cn/',
      'x-oss-date': timeStr,
      'x-oss-user-agent': 'aliyun-sdk-js/6.6.1 Chrome 98.0.4758.80 on Windows 10 64-bit'
    },
    body: chunk
  });
  if (rsp.status !== 200) {
    return Promise.reject(new Error(`up status: ${rsp.status}, error: ${await rsp.text()}`))
  }
  return rsp.headers.get("Etag") || '';
}

export async function quarkOrUcUpCommit(pre: UpPreRespData, md5: Array<string>, driver: DiskDriverForQuarkOrUc) {
  const timeStr = dayjs().format("ddd, DD MMM YYYY HH:mm:ss [GMT]");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<CompleteMultipartUpload>
${md5.map((m, i) => `  <Part>
    <PartNumber>${i}</PartNumber>
    <ETag>${m}</ETag>
  </Part>`)}
</CompleteMultipartUpload>
`
  const contentMd5 = crypto.createHash('md5').setEncoding('base64').update(body).digest("base64");
  const callbackBase64 = btoa(JSON.stringify(pre.callback));
  const data = {
    "auth_info": pre.auth_info,
    "auth_meta": `POST
${contentMd5}
application/xml
${timeStr}
x-oss-callback:${callbackBase64}
x-oss-date:${timeStr}
x-oss-user-agent:aliyun-sdk-js/6.6.1 Chrome 98.0.4758.80 on Windows 10 64-bit
/${pre.bucket}/${pre.obj_key}?uploadId=${pre.upload_id}`,
    "task_id": pre.task_id,
  }
  const resp = await quarkOrUcRequest<UpAuthRespData, any>("/file/upload/auth", 'POST', {
    data
  }, driver);
  const u = new URL(`https://${pre.bucket}.${pre.upload_url.substring(7)}/${pre.obj_key}`);
  u.searchParams.set("uploadId", pre.upload_id);
  const res = await fetch(u, {
    headers: {
      "Authorization": resp.data.auth_key,
      "Content-MD5": contentMd5,
      "Content-Type": "application/xml",
      "Referer": "https://pan.quark.cn/",
      "x-oss-callback": callbackBase64,
      "x-oss-date": timeStr,
      "x-oss-user-agent": "aliyun-sdk-js/6.6.1 Chrome 98.0.4758.80 on Windows 10 64-bit",
    },
    body
  });
  if (res.status !== 200) return Promise.reject(new Error(`up status: ${res.status}, error: ${await res.text()}`));

}

export async function quarkOrUcUpFinish(pre: UpPreRespData, driver: DiskDriverForQuarkOrUc) {
  await quarkOrUcRequest("/file/upload/finish", 'POST', {
    data: {
      "obj_key": pre.obj_key,
      "task_id": pre.task_id,
    }
  }, driver);
  await Bun.sleep(1000);
}

