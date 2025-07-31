import {AbsDiskPluginStore} from "@/modules/disk/abs/AbsDiskPluginStore";
import {DiskConfigQuarkUc, DiskFormQuarkUc} from "@/modules/disk/impl/quark-or-uc/types";
import {DiskSourceView} from "@/types/SourceDisk";
import {DirCoreItem, DirItem} from "@/modules/disk/DiskPlugin";

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
      data: {
        ...this.props,
        Cookie: cookie
      }
    });
    this.props['Cookie'] = cookie;
  }

  cp(item: DirCoreItem, destinationFolder: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  exists(path: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  getFileDownloadLink(file: DirCoreItem): Promise<string> {
    return Promise.resolve("");
  }

  mkdir(folder: DirCoreItem, name: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  mv(item: DirCoreItem, newPath: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  readDir(path: string): Promise<Array<DirItem>> {
    return Promise.resolve([]);
  }

  readFileAsString(file: DirCoreItem): Promise<string> {
    return Promise.resolve("");
  }

  rename(item: DirCoreItem, newName: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  rm(item: DirCoreItem): Promise<void> {
    return Promise.resolve(undefined);
  }

  writeFileFromBlob(file: DirCoreItem, content: Blob): Promise<void> {
    return Promise.resolve(undefined);
  }

  writeFileFromString(file: DirCoreItem, content: string): Promise<void> {
    return Promise.resolve(undefined);
  }
}