import { DiskPlugin, FileState } from "@/modules/disk/DiskPlugin";
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

  abstract getFileDownloadLink(item: string): Promise<string>;
}
