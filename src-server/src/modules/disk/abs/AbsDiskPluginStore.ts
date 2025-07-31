import {DirCoreItem, DirItem, DiskFileLink, DiskPlugin} from "@/modules/disk/DiskPlugin";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {storage} from "@/global/db";
import {sourceDiskDao} from "@/dao";

export abstract class AbsDiskPluginStore implements DiskPlugin {
  private readonly id: string;
  private readonly prefix: string;

  protected constructor(id: string) {
    this.id = id;
    this.prefix = `${LocalNameEnum.STORE_SOURCE_DISK}/${id}/`;
  }

  public getItem<T extends Record<string, any> | string | number | boolean>(
    key: string
  ): Promise<T | null> {
    return storage.getItem<T>(this.prefix + key);
  }

  public async setItem<
    T extends Record<string, any> | string | number | boolean
  >(key: string, value: T) {
    await storage.setItem(this.prefix + key, value);
  }

  public async removeItem(key: string) {
    await storage.removeItem(this.prefix + key);
  }

  public async updateData(data: any) {
    // 更新数据
    await sourceDiskDao.update(this.id, {
      data: data,
    });
  }

  abstract cp(item: DirItem, destinationFolder: string): Promise<void>;

  abstract getFileDownloadLink(file: DirCoreItem): Promise<DiskFileLink>;

  abstract mkdir(folder: DirItem, name: string): Promise<void>;

  abstract mv(item: DirItem, newPath: string): Promise<void>;

  abstract readDir(path: string): Promise<Array<DirItem>>;

  abstract readFile(file: DirCoreItem, headers: Record<string, string>): Promise<Response>;

  abstract rename(item: DirItem, newName: string): Promise<void>;

  abstract rm(item: DirItem): Promise<void>;

  abstract writeFile(file: DirCoreItem): Promise<WritableStream>;

}
