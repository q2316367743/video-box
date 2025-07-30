import {AbsDiskPluginStore} from "@/modules/disk/abs/AbsDiskPluginStore";
import {DiskSourceView} from "@/types/SourceDisk";
import {createClient, WebDAVClient, AuthType} from "webdav";
import {extname} from "@/utils/WebPath";
import {DirItem} from "@/modules/disk/DiskPlugin";

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

  cp(item: DirItem, destinationFolder: string): Promise<void> {
    const {path} = item;
    return this.client.copyFile(path, destinationFolder);
  }

  exists(path: string): Promise<boolean> {
    return this.client.exists(path);
  }

  mkdir(item: DirItem): Promise<void> {
    const {path} = item;
    return this.client.createDirectory(path);
  }

  mv(item: DirItem, newPath: string): Promise<void> {
    const {path} = item;
    return this.client.moveFile(path, newPath);
  }

  async readDir(path: string): Promise<Array<DirItem>> {
    const files = await this.client.getDirectoryContents(path, {
      details: false,
    });
    const prefix = path === '/' ? '' : path;
    return (Array.isArray(files) ? files : files.data).map((file) => {
      return {
        name: file.basename,
        size: file.size,
        extname: extname(file.basename),
        folder: path,
        type: file.type === "directory" ? 'folder' : file.type === "file" ? 'file' : 'unknow',
        lastModified: file.lastmod,
        path: prefix + "/" + file.basename,
        expands: {
          sign: file.etag,
          mime: file.mime,
        },
      };
    });
  }

  async readFileAsString(file: DirItem): Promise<string> {
    const content = await this.client.getFileContents(file.path, {
      format: "text",
      details: false,
    });
    return content as string;
  }

  rename(item: DirItem, newName: string): Promise<void> {
    const {path, folder} = item;
    return this.client.moveFile(path, folder + "/" + newName);
  }

  rm(item: DirItem): Promise<void> {
    const {path} = item;
    return this.client.deleteFile(path);
  }

  async writeFileFromBlob(file: DirItem, content: Blob): Promise<void> {
    const {path} = file;
    const data = await content.arrayBuffer();
    await this.client.putFileContents(path, data);
  }

  async writeFileFromString(file: DirItem, content: string): Promise<void> {
    const {path} = file;
    await this.client.putFileContents(path, content);
  }

  private getDownloadLinkSync(item: string): string {
    const link = this.client.getFileDownloadLink(item);
    return `/api/proxy/url/${encodeURIComponent(link)}`;
  }

  async getFileDownloadLink(path: string): Promise<string> {
    return this.getDownloadLinkSync(path);
  }
}
