import {AxiosRequestConfig} from "axios";
import {AbsDiskPluginStore} from "@/modules/disk/abs/AbsDiskPluginStore";
import {DirItem} from "@/modules/disk/DiskPlugin";
import {DiskSourceEntry} from "@/types/SourceDisk";
import {useRequest} from "@/global/http";
import {extname} from "@/utils/WebPath";

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
  private readonly path: string;

  constructor(source: DiskSourceEntry) {
    super(source.id);
    this.props = source.data as DiskFromAList;
    this.path = source.path;
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

  async cp(item: DirItem, destinationFolder: string): Promise<void> {
    const {path} = item;
    let nameIndex = path.lastIndexOf("/");
    let src_dir = path.substring(0, nameIndex);
    let name = path.substring(nameIndex + 1);
    await this.request('/api/fs/copy', {
      method: 'POST',
      data: {
        src_dir,
        dst_dir: destinationFolder,
        names: [name]
      }
    });
  }

  exists(path: string): Promise<boolean> {
    return Promise.resolve(true);
  }

  mkdir(item: DirItem): Promise<void> {
    const {path} = item;
    return this.request<void>('/api/fs/mkdir', {
      method: 'POST',
      data: {
        path
      }
    })
  }

  async mv(item: DirItem, destinationPath: string): Promise<void> {
    const {path} = item;
    let nameIndex = path.lastIndexOf("/");
    let src_dir = path.substring(0, nameIndex);
    let name = path.substring(nameIndex + 1);
    let dstDirIndex = destinationPath.lastIndexOf("/");
    let dst_dir = destinationPath.substring(0, dstDirIndex);
    await this.request('/api/fs/move', {
      method: 'POST',
      data: {
        src_dir,
        dst_dir,
        names: [name]
      }
    })
  }

  async readDir(path: string): Promise<Array<DirItem>> {
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
    if (path === '/') {
      path = this.path;
    }
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
          expands: {
            sign: temp.sign
          }
        });
      }
    }
    return items;
  }

  async getFileDownloadLink(item: DirItem): Promise<string> {
    const {path} = item;
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
    return url;
  }

  async readFileAsString(item: DirItem): Promise<string> {
    let url = await this.getFileDownloadLink(item);
    return this.request<string>(url, {
      method: 'GET',
      responseType: 'text',
    })
  }

  async rm(item: DirItem): Promise<void> {
    const {path} = item;
    const nameIndex = path.lastIndexOf("/");
    const dir = path.substring(0, nameIndex);
    const name = path.substring(nameIndex + 1);
    await this.request('/api/fs/remove', {
      method: 'POST',
      data: {
        dir,
        names: [name]
      }
    })
  }

  rename(item: DirItem, newName: string): Promise<void> {
    const {path} = item;
    return this.request<void>('/api/fs/rename', {
      method: 'POST',
      data: {
        name: newName,
        path: path
      }
    })
  }

  writeFileFromBlob(file: DirItem, content: Blob): Promise<void> {
    const {path} = file;
    const formData = new FormData();
    formData.append('file', content);
    return this.request('/api/fs/form', {
      method: 'PUT',
      headers: {
        "File-Path": encodeURIComponent(path)
      },
      data: formData,
    })
  }

  writeFileFromString(file: DirItem, content: string): Promise<void> {
    const {path} = file;
    return this.request<void>('/api/fs/put', {
      method: 'PUT',
      data: content,
      headers: {
        "File-Path": encodeURIComponent(path),
        "Content-Type": "text/plain"
      },
    })
  }


}