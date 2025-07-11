import {DiskPlugin, FileState} from "@/modules/disk/DiskPlugin";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {getItem, removeItem, setItem} from "@/utils/utools/DbStorageUtil";

export abstract class AbsDiskPluginStore implements DiskPlugin {

  private readonly prefix: string;

  protected constructor(id: string) {
    this.prefix = `${LocalNameEnum.STORE_SOURCE_DISK}/${id}/`;
  }

  protected getItem<T>(key: string): T | null {
    return getItem<T>(this.prefix + key);
  }

  protected setItem<T>(key: string, value: T) {
    setItem(this.prefix + key, value)
  }

  protected removeItem(key: string) {
    removeItem(this.prefix + key);
  }

  abstract cp(path: string, destinationFolder: string): Promise<void>;

  abstract exists(path: string): Promise<boolean>;

  abstract mkdir(path: string): Promise<void>;

  abstract mv(oldPath: string, newPath: string): Promise<void>;

  abstract readDir(path: string): Promise<Array<FileState>>;

  abstract readFileAsString(path: string): Promise<string>;

  abstract rm(path: string): Promise<void>;

  abstract rename(path: string, newName: string): Promise<void>;

  abstract writeFileFromBlob(path: string, content: Blob): Promise<void>;

  abstract writeFileFromString(path: string, content: string): Promise<void>;

  abstract getFileDownloadLinks(items: string[]): Promise<string[]>;

}