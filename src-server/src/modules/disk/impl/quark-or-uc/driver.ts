import {AbsDiskPluginStore} from "@/modules/disk/abs/AbsDiskPluginStore";
import {DiskConfigQuarkUc, DiskFormQuarkUc} from "@/modules/disk/impl/quark-or-uc/types";
import {DiskSourceView} from "@/types/SourceDisk";
import {DirItem, DiskFileLink} from "@/modules/disk/DiskPlugin";
import {quarkOrUcDownloadLink, quarkOrUcGetFiles} from "@/modules/disk/impl/quark-or-uc/utils";
import {SourceDiskDir} from "@/types/SourceDiskDIr";

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

  async getFileDownloadLink(file: SourceDiskDir): Promise<DiskFileLink> {
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

  readDir(parent: SourceDiskDir): Promise<Array<DirItem>> {
    return quarkOrUcGetFiles(parent, this);
  }

  async readFile(file: SourceDiskDir, headers: Record<string, string>, signal: AbortSignal): Promise<Response> {
    const link = await this.getFileDownloadLink(file);
    const rsp = await fetch(link.url, {
      headers: {
        ...headers,
        ...link.headers
      },
      signal
    });
    return new Response(rsp.body, {
      headers: rsp.headers,
      status: rsp.status,
      statusText: rsp.statusText
    });
  }

  writeFile(file: SourceDiskDir): Promise<WritableStream> {
    return Promise.resolve(new WritableStream());
  }

}