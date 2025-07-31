import {AbsDiskPluginStore} from "@/modules/disk/abs/AbsDiskPluginStore";
import {DiskSourceView} from "@/types/SourceDisk";
import {DirCoreItem, DirItem} from "@/modules/disk/DiskPlugin";
import {DiskFromQuarkOpen} from "@/modules/disk/impl/quark-open/types";

export class DiskPluginForQuarkOpen extends AbsDiskPluginStore {

  private readonly props: DiskFromQuarkOpen;
  private readonly baseURL = 'https://open-api-drive.quark.cn';

  constructor(source: DiskSourceView) {
    super(source.id);
    this.props = source.data as DiskFromQuarkOpen;
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