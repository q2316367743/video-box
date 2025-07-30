import {DirItem, DiskPlugin} from "@/modules/disk/DiskPlugin";
import { LocalNameEnum } from "@/global/LocalNameEnum";
import { storage } from "@/global/db";

export abstract class AbsDiskPluginStore implements DiskPlugin {
  private readonly prefix: string;

  protected constructor(id: string) {
    this.prefix = `${LocalNameEnum.STORE_SOURCE_DISK}/${id}/`;
  }

  protected getItem<T extends Record<string, any> | string | number | boolean>(
    key: string
  ): Promise<T | null> {
    return storage.getItem<T>(this.prefix + key);
  }

  protected async setItem<
    T extends Record<string, any> | string | number | boolean
  >(key: string, value: T) {
    await storage.setItem(this.prefix + key, value);
  }

  protected async removeItem(key: string) {
    await storage.removeItem(this.prefix + key);
  }

  abstract cp(item: DirItem, destinationFolder: string): Promise<void>;

  abstract exists(path: string): Promise<boolean>;

  abstract getFileDownloadLink(path: string): Promise<string>;

  abstract mkdir(folder: DirItem, name: string): Promise<void>;

  abstract mv(item: DirItem, newPath: string): Promise<void>;

  abstract readDir(path: string): Promise<Array<DirItem>>;

  abstract readFileAsString(file: DirItem): Promise<string>;

  abstract rename(item: DirItem, newName: string): Promise<void>;

  abstract rm(item: DirItem): Promise<void>;

  abstract writeFileFromBlob(file: DirItem, content: Blob): Promise<void>;

  abstract writeFileFromString(file: DirItem, content: string): Promise<void>;
}
