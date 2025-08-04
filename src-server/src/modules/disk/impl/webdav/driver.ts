import * as crypto from 'node:crypto';
import {AbsDiskPluginStore} from "@/modules/disk/abs/AbsDiskPluginStore";
import {DiskSourceView} from "@/types/SourceDisk";
import {extname, joinPath} from "@/utils/WebPath";
import {DirItem, DiskFileLink, DiskUploadOption} from "@/modules/disk/DiskPlugin";
import {createClient, WebDAVClient} from "webdav";
import {SourceDiskDir} from "@/types/SourceDiskDIr";

interface DiskFromWebDAV {
  url: string;
  username: string;
  password: string;
  type: 'auto' | 'digest' | 'none' | 'password' | 'token';
}


export class DiskPluginForWebDAV extends AbsDiskPluginStore {
  private readonly props: DiskFromWebDAV;
  private readonly client: WebDAVClient;

  constructor(source: DiskSourceView) {
    super(source.id);
    this.props = source.data as DiskFromWebDAV;
    this.client = createClient(this.props.url, {
      username: this.props.username,
      password: this.props.password,
      // authType: this.props.type as AuthType,
    });
  }

  async cp(file: SourceDiskDir, folder: SourceDiskDir): Promise<void> {
    await this.client.copyFile(file.path, folder.path);
  }


  async mkdir(folder: SourceDiskDir, name: string): Promise<void> {
    await this.client.createDirectory(`${folder.path}/${name}`)
  }

  async mv(file: SourceDiskDir, folder: SourceDiskDir): Promise<void> {
    return this.client.moveFile(file.path, folder.path);
  }

  async list(parent: SourceDiskDir): Promise<Array<DirItem>> {
    const {path} = parent;
    const files = await this.client.getDirectoryContents(path, {
      details: false,
    });
    const prefix = path === '/' ? '' : path;
    return (Array.isArray(files) ? files : files.data).map((file) => {
      const p = prefix + "/" + file.basename;
      return {
        name: file.basename,
        size: file.size,
        extname: file.type === "file" ? extname(file.basename) : '',
        folder: path,
        type: file.type === "directory" ? 'folder' : file.type === "file" ? 'file' : 'unknow',
        lastModified: file.lastmod,
        path: p,
        expands: {
          sign: file.etag,
          mime: file.mime,
        },
        sign: crypto.createHash('md5').update(p).digest('hex'),
      };
    });
  }

  private parseBasicAuthUrl(input: string) {
    const url = new URL(input);

    // 提取 username 和 password
    const username = url.username;
    const password = url.password;

    if (!username || !password) {
      throw new Error('URL 中未包含 Basic Auth 信息');
    }

    // 生成 Authorization 头
    const authHeader = 'Basic ' + btoa(`${username}:${password}`);

    // 清理 URL（移除 username:password）
    url.username = '';
    url.password = '';

    return {
      url: url.toString(),
      Authorization: authHeader,
    };
  }

  async readFile(file: SourceDiskDir, headers: Record<string, string>, signal: AbortSignal): Promise<Response> {
    const link = await this.getFileDownloadLink(file);
    const {url, Authorization} = this.parseBasicAuthUrl(link.url);
    const rsp = await fetch(url, {
      headers: {
        ...headers,
        ...link.headers,
        Authorization
      },
      signal
    });
    return new Response(rsp.body, {
      headers: rsp.headers,
      status: rsp.status,
      statusText: rsp.statusText
    });
  }

  async rename(item: SourceDiskDir, newName: string): Promise<void> {
    const {path, folder} = item;
    const destinationFilename = (folder === '/' ? '' : folder) + "/" + newName;
    return this.client.moveFile(path, destinationFilename);
  }

  async rm(item: SourceDiskDir): Promise<void> {
    const {path} = item;
    return this.client.deleteFile(path);
  }

  async writeFile(folder: SourceDiskDir, option: DiskUploadOption): Promise<WritableStream> {
    const {filename, overwrite} = option
    const writable = this.client.createWriteStream(joinPath(folder.path, filename), {overwrite});
    return new WritableStream({
      write: (chunk) => {
        writable.write(chunk);
      },
      abort: (reason) => {
        writable.destroy(reason)
      },
      close: () => {
        writable.end();
      }
    })
  }

  async getFileDownloadLink(file: SourceDiskDir): Promise<DiskFileLink> {
    const {path} = file;
    const url = this.client.getFileDownloadLink(path);
    return {url};
  }

}
