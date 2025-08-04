import {DirItem, DiskFileLink, DiskPlugin, DiskUploadOption} from "@/modules/disk/DiskPlugin";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {storage} from "@/global/db";
import {sourceDiskDao} from "@/dao";
import {SourceDiskDir} from "@/types/SourceDiskDIr";

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

  abstract cp(file: SourceDiskDir, folder: SourceDiskDir): Promise<void>;

  abstract getFileDownloadLink(file: SourceDiskDir): Promise<DiskFileLink>;

  abstract mkdir(folder: SourceDiskDir, name: string): Promise<void>;

  abstract mv(file: SourceDiskDir, folder: SourceDiskDir): Promise<void>;

  abstract list(parent: SourceDiskDir): Promise<Array<DirItem>>;

  abstract readFile(file: SourceDiskDir, headers: Record<string, string>, signal: AbortSignal): Promise<Response>;

  abstract rename(item: SourceDiskDir, newName: string): Promise<void>;

  abstract rm(item: SourceDiskDir): Promise<void>;

  abstract writeFile(folder: SourceDiskDir, option: DiskUploadOption): Promise<WritableStream>;

}
