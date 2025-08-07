import {AxiosRequestConfig} from "axios";
import {AbsDiskPluginStore} from "@/modules/disk/abs/AbsDiskPluginStore";
import {DirItem, DiskFileLink, DiskUploadOption} from "@/modules/disk/DiskPlugin";
import {DiskSourceView} from "@/types/SourceDisk";
import {useRequest} from "@/global/http";
import {extname, joinPath} from "@/utils/WebPath";
import {SourceDiskDir} from "@/types/SourceDiskDIr";
import {shake} from "@/utils/lang/RecordUtil";

interface DiskFromAList {
  url: string;
  authorization: string;
}


/**
 * 通用响应内容
 */
interface Result<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 文件数据
 */
export interface FileData {
  content: FileItem[];
  total: number;
  readme: string;
  write: boolean;
  provider: string;
}

/**
 * 文件项
 */
export interface FileItem {
  // 文件名
  name: string;
  // 文件大小
  size: number;
  // 是否是目录
  is_dir: boolean;
  // 修改时间
  modified: string;
  // 签名
  sign: string;
  // 封面
  thumb: string;
  // 类型
  type: number;
}

interface FileInfo {
  name: string;
  size: number;
  is_dir: boolean;
  modified: string;
  sign: string;
  thumb: string;
  type: number;
  raw_url: string;
  readme: string;
  provider: string;
  related?: any;
}

export class DiskPluginForAListV3 extends AbsDiskPluginStore {

  private readonly props: DiskFromAList;

  constructor(source: DiskSourceView) {
    super(source.id);
    this.props = source.data as DiskFromAList;
  }

  private async request<T>(url: string, config: AxiosRequestConfig): Promise<T> {
    let {authorization} = this.props;
    const {data} = await useRequest<Result<T>>(url, {
      ...config,
      baseURL: this.props.url,
      headers: {
        ...config.headers,
        Authorization: authorization
      }
    });
    if (data.code !== 200) {
      return Promise.reject(new Error(data.message));
    }
    return data.data;
  }

  async cp(file: SourceDiskDir, folder: SourceDiskDir): Promise<void> {
    const {path} = file;
    let nameIndex = path.lastIndexOf("/");
    let src_dir = path.substring(0, nameIndex);
    let name = path.substring(nameIndex + 1);
    await this.request('/api/fs/copy', {
      method: 'POST',
      data: {
        src_dir,
        dst_dir: folder.path,
        names: [name]
      }
    });
  }

  mkdir(item: SourceDiskDir): Promise<void> {
    const {path} = item;
    return this.request<void>('/api/fs/mkdir', {
      method: 'POST',
      data: {
        path
      }
    })
  }

  async mv(file: SourceDiskDir, folder: SourceDiskDir): Promise<void> {
    let nameIndex = file.path.lastIndexOf("/");
    let src_dir = file.path.substring(0, nameIndex);
    let name = file.path.substring(nameIndex + 1);
    let dstDirIndex = folder.path.lastIndexOf("/");
    let dst_dir = folder.path.substring(0, dstDirIndex);
    await this.request('/api/fs/move', {
      method: 'POST',
      data: {
        src_dir,
        dst_dir,
        names: [name]
      }
    })
  }

  async list(parent: SourceDiskDir): Promise<Array<DirItem>> {
    const {path} = parent;
    const result = await this.request<FileData>('/api/fs/list', {
      method: 'POST',
      data: {
        path,
        password: "",
        page: 1,
        per_page: 0,
        refresh: false
      },
    });
    let items = new Array<DirItem>();
    let {content} = result;
    if (content) {
      for (let temp of content) {
        items.push({
          name: temp.name,
          size: temp.size,
          extname: temp.is_dir ? '' : extname(temp.name),
          folder: path,
          type: temp.is_dir ? 'folder' : 'file',
          lastModified: temp.modified,
          path: path + '/' + temp.name,
          cover: temp.thumb,
          sign: temp.sign
        });
      }
    }
    return items;
  }

  async getFileDownloadLink(file: SourceDiskDir): Promise<DiskFileLink> {
    const {path} = file;
    const result = await this.request<FileInfo>('/api/fs/get', {
      method: 'POST',
      data: {
        path: path,
        password: ''
      },
    })
    let url = result.raw_url as string;
    if (this.props.url.startsWith("https") && !url.startsWith("https")) {
      // 如果站点是https，但是链接不是
      url = url.replace('http', 'https');
    }
    return {url};
  }

  async rm(item: SourceDiskDir): Promise<void> {
    const {folder, name} = item;
    await this.request('/api/fs/remove', {
      method: 'POST',
      data: {
        dir: folder,
        names: [name]
      }
    })
  }

  rename(item: SourceDiskDir, newName: string): Promise<void> {
    const {path} = item;
    return this.request<void>('/api/fs/rename', {
      method: 'POST',
      data: {
        name: newName,
        path: path
      }
    })
  }

  async readFile(request: Request, file: SourceDiskDir): Promise<Response> {
    let link = await this.getFileDownloadLink(file);
    const rsp = await fetch(link.url, {
      headers: {
        ...request.headers,
        ...link.headers
      },
      signal: request.signal
    });
    return new Response(rsp.body, {
      headers: rsp.headers,
      status: rsp.status,
      statusText: rsp.statusText
    });
  }

  async writeFile(request: Request, folder: SourceDiskDir, option: DiskUploadOption): Promise<void> {
    const {filename, overwrite, contentType, contentLength, md5, sha256, sha1} = option;
    if (request.signal.aborted) return Promise.reject(new Error("请求被终止"));
    let {authorization} = this.props;
    await fetch(new URL('/api/fs/stream', this.props.url), {
      method: 'PUT',
      headers: shake({
        Authorization: authorization,
        "File-Path": encodeURIComponent(joinPath(folder.path, filename)),
        'As-Task': 'false',
        'Overwrite': overwrite ? 'true' : 'false',
        'X-File-Md5': md5,
        'X-File-Sha1': sha1,
        'X-File-Sha256': sha256,
        'Content-Type': contentType,
        'Content-Length': contentLength
      }),
      body: request.body,
      signal: request.signal
    })
  }


}