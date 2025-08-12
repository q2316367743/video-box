import {BaseMapper} from "@/modules/database/BaseMapper";
import {SourceDiskDir} from "@/types/SourceDiskDIr";
import {Database} from "db0";
import {DirItem} from "@/modules/disk/DiskPlugin";

export class SourceDiskDirDao extends BaseMapper<SourceDiskDir> {
  constructor(db: Database) {
    super(db, "source_disk_dir");
  }

  root(source_disk_id: string): SourceDiskDir {
    return {
      sign: '',
      path: '/',
      folder: '',
      name: '',
      type: 'folder',
      size: 0,
      last_modified: 0,
      expands: '',
      cover: '',
      cache: 0,
      extname: '',
      id: '',
      create_time: 0,
      source_disk_id,
      update_time: 0
    }
  }

  async readDir(parent: SourceDiskDir): Promise<Array<DirItem>> {
    const items = await this.query().eq('folder', parent.path).eq('source_disk_id', parent.source_disk_id).list();
    return items.map(item => {
      let expands = {};
      if (item.expands) {
        try {
          expands = JSON.parse(item.expands);
        } catch (e) {
          console.error(e);
        }
      }
      return {
        name: item.name,
        type: item.type,
        folder: item.folder,
        path: item.path,
        sign: item.sign,
        size: item.size,
        lastModified: item.last_modified,
        extname: item.extname,
        cover: item.cover,
        expands,
      } as DirItem
    })
  }

  /**
   * 保存缓存
   * @param items 缓存
   * @param source_disk_id 源盘ID
   */
  async saveCache(items: Array<DirItem>, source_disk_id: string): Promise<Array<SourceDiskDir>> {
    await this.db.exec("BEGIN");
    const res = new Array<SourceDiskDir>();
    try {
      for (let item of items) {
        res.push(await this.insert({
          sign: item.sign,
          name: item.name,
          type: item.type,
          folder: item.folder,
          path: item.path,
          size: item.size || 0,
          last_modified: item.lastModified,
          extname: item.extname || '',
          cover: item.cover || '',
          expands: item.expands ? JSON.stringify(item.expands) : '',
          cache: 0,
          create_time: Date.now(),
          source_disk_id,
          update_time: Date.now(),
        }))
      }
      await this.db.exec("COMMIT");
      return res;
    } catch (e) {
      console.error(e);
      await this.db.exec("ROLLBACK");
      throw e;
    }
  }

  async getFromPath(path: string, sourceDiskId: string): Promise<SourceDiskDir | null> {
    return await this.query().eq('path', path).eq('source_disk_id', sourceDiskId).one();
  }

  async listFromFolder(folder: string, sourceDiskId: string): Promise<Array<SourceDiskDir>> {
    return await this.query().eq('folder', folder).eq('source_disk_id', sourceDiskId).list();
  }

}