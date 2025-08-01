import * as crypto from 'node:crypto';
import {AbsDiskPluginStore} from "@/modules/disk/abs/AbsDiskPluginStore";
import {DiskSourceView} from "@/types/SourceDisk";
import {extname} from "@/utils/WebPath";
import {DirItem, DiskFileLink} from "@/modules/disk/DiskPlugin";
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

  async cp(item: DirItem, destinationFolder: string): Promise<void> {
    await this.client.copyFile(item.path, destinationFolder);
  }


  async mkdir(folder: DirItem, name: string): Promise<void> {
    await this.client.createDirectory(`${folder.path}/${name}`)
  }

  async mv(item: DirItem, newPath: string): Promise<void> {
    const {path} = item;
    return this.client.moveFile(path, newPath);
  }

  async readDir(parent: SourceDiskDir): Promise<Array<DirItem>> {
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

  async readFile(file: SourceDiskDir, headers: Record<string, string>): Promise<Response> {
    const readable = this.client.createReadStream(file.path, {
      headers: headers
    });
    return new Response(new ReadableStream({
      start(controller) {
        readable.on('data', chunk => {
          controller.enqueue(chunk)
        })
      },
      cancel(reason) {
        readable.destroy(reason);
      }
    }), {status: 200, statusText: 'OK'})
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

  async writeFile(file: SourceDiskDir): Promise<WritableStream> {
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

  async getFileDownloadLink(file: SourceDiskDir): Promise<DiskFileLink> {
    const {path} = file;
    const url = this.client.getFileDownloadLink(path);
    return {url};
  }

}
