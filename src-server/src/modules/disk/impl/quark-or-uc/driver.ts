import {AbsDiskPluginStore} from "@/modules/disk/abs/AbsDiskPluginStore";
import {DiskConfigQuarkUc, DiskFormQuarkUc} from "@/modules/disk/impl/quark-or-uc/types";
import {DiskSourceView} from "@/types/SourceDisk";
import {DirCoreItem, DirItem, DiskFileLink} from "@/modules/disk/DiskPlugin";
import {quarkOrUcDownloadLink, quarkOrUcGetFiles} from "@/modules/disk/impl/quark-or-uc/utils";

export class DiskDriverForQuarkOrUc extends AbsDiskPluginStore {
  public readonly props: DiskFormQuarkUc;
  public readonly config: DiskConfigQuarkUc;

  constructor(source: DiskSourceView, config: DiskConfigQuarkUc) {
    super(source.id);
    this.props = source.data as DiskFormQuarkUc;
    this.config = config;
  }

  public async updateCookie(cookie: string) {
    await this.updateData({
      ...this.props,
      Cookie: cookie
    });
    this.props['Cookie'] = cookie;
  }

  cp(item: DirItem, destinationFolder: string): Promise<void> {
    return Promise.resolve(undefined);
  }


  mkdir(folder: DirItem, name: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  mv(item: DirItem, newPath: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  rename(item: DirItem, newName: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  rm(item: DirItem): Promise<void> {
    return Promise.resolve(undefined);
  }

  async getFileDownloadLink(file: DirCoreItem): Promise<DiskFileLink> {
    const url = await quarkOrUcDownloadLink(file, this);
    return {
      url,
      headers: {
        Cookie: this.props.Cookie,
        Referer: this.config.referer,
        'User-Agent': this.config.ua,
      },
      concurrency: 3,
      part_size: 1024 * 1024 * 10
    }
  }

  readDir(path: string): Promise<Array<DirItem>> {
    return quarkOrUcGetFiles(path, this);
  }

  async readFile(file: DirCoreItem, headers: Record<string, string>): Promise<Response> {
    const link = await this.getFileDownloadLink(file);
    const rsp = await fetch(link.url, {
      headers: {
        ...headers,
        ...link.headers
      }
    });
    return new Response(rsp.body, {
      headers: rsp.headers,
    });
  }

  writeFile(file: DirCoreItem): Promise<WritableStream> {
    return Promise.resolve(new WritableStream());
  }

}