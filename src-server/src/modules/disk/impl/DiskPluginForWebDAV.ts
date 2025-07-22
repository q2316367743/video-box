import { FileState } from "@/modules/disk/DiskPlugin";
import { AbsDiskPluginStore } from "@/modules/disk/abs/AbsDiskPluginStore";
import { DiskFromWebDAV, DiskSource } from "@/types/SourceDisk";
import { createClient, WebDAVClient, AuthType } from "webdav";
import { basename, extname } from "@/utils/WebPath";

export class DiskPluginForWebDAV extends AbsDiskPluginStore {
  private readonly props: DiskFromWebDAV;
  private readonly path: string;
  private readonly client: WebDAVClient;

  constructor(source: DiskSource<"WEB_DAV">) {
    super(source.id);
    this.props = source.data;
    this.path = source.path;
    this.client = createClient(this.props.url, {
      username: this.props.username,
      password: this.props.password,
      authType: this.props.type as AuthType,
    });
  }

  cp(path: string, destinationFolder: string): Promise<void> {
    return this.client.copyFile(path, destinationFolder);
  }

  exists(path: string): Promise<boolean> {
    return this.client.exists(path);
  }

  mkdir(path: string): Promise<void> {
    return this.client.createDirectory(path);
  }

  mv(oldPath: string, newPath: string): Promise<void> {
    return this.client.moveFile(oldPath, newPath);
  }

  async readDir(path: string): Promise<Array<FileState>> {
    if (path === "/") path = this.path;
    const files = await this.client.getDirectoryContents(path, {
      details: false,
    });
    return (Array.isArray(files) ? files : files.data).map((file) => {
      return {
        name: basename(file.basename),
        size: file.size,
        extname: extname(file.basename),
        isDirectory: file.type === "directory",
        isFile: file.type === "file",
        lastModified: file.lastmod,
        path: path + "/" + file.basename,
        expands: {
          sign: file.etag,
          mime: file.mime,
        },
      };
    });
  }

  async readFileAsString(path: string): Promise<string> {
    const content = await this.client.getFileContents(path, {
      format: "text",
      details: false,
    });
    return content as string;
  }

  rename(path: string, newName: string): Promise<void> {
    const folder = path.split("/").pop();
    return this.client.moveFile(path, folder + "/" + newName);
  }

  rm(path: string): Promise<void> {
    return this.client.deleteFile(path);
  }

  async writeFileFromBlob(path: string, content: Blob): Promise<void> {
    const data = await content.arrayBuffer();
    await this.client.putFileContents(path, data);
  }

  async writeFileFromString(path: string, content: string): Promise<void> {
    await this.client.putFileContents(path, content);
  }

  private getDownloadLinkSync(item: string): string {
    const link = this.client.getFileDownloadLink(item);
    return `/api/proxy/${encodeURIComponent(link)}`;
  }

  async getFileDownloadLinks(items: string[]): Promise<string[]> {
    return items.map(this.getDownloadLinkSync);
  }

  async getFileDownloadLink(item: string): Promise<string> {
    return this.getDownloadLinkSync(item);
  }
}
