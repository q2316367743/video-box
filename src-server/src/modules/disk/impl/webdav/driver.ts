import {AbsDiskPluginStore} from "@/modules/disk/abs/AbsDiskPluginStore";
import {DiskSourceView} from "@/types/SourceDisk";
import {extname} from "@/utils/WebPath";
import {DirItem, DiskFileLink} from "@/modules/disk/DiskPlugin";
import {createClient, WebDAVClient} from "webdav";

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

  async cp(item: DirItem, destinationFolder: string): Promise<void> {
    await this.client.copyFile(item.path, destinationFolder);
  }

  async getFileDownloadLink(file: DirItem): Promise<DiskFileLink> {
    const link = this.client.getFileDownloadLink(file.path);
    return {url: link}
  }

  async mkdir(folder: DirItem, name: string): Promise<void> {
    await this.client.createDirectory(`${folder.path}/${name}`)
  }

  async mv(item: DirItem, newPath: string): Promise<void> {
    const {path} = item;
    return this.client.moveFile(path, newPath);
  }

  async readDir(item: DirItem): Promise<Array<DirItem>> {
    const {path} = item;
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

  async readFile(file: DirItem): Promise<ReadableStream> {
    const readable = this.client.createReadStream(file.path);
    return new ReadableStream({
      start(controller) {
        readable.on('data', chunk => {
          controller.enqueue(chunk)
        })
      },
      cancel(reason) {
        readable.destroy(reason);
      },
    })
  }

  async rename(item: DirItem, newName: string): Promise<void> {
    const {path, folder} = item;
    const destinationFilename = (folder === '/' ? '' : folder) + "/" + newName;
    return this.client.moveFile(path, destinationFilename);
  }

  async rm(item: DirItem): Promise<void> {
    const {path} = item;
    return this.client.deleteFile(path);
  }

  async writeFile(file: DirItem): Promise<WritableStream> {
    const writable = this.client.createWriteStream(file.path, {overwrite: true});
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

}
