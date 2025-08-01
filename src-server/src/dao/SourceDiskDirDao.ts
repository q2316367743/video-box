import {BaseMapper} from "@/modules/database/BaseMapper";
import {SourceDiskDir} from "@/types/SourceDiskDIr";
import {Database} from "db0";
import {DirItem} from "@/modules/disk/DiskPlugin";
import dayjs from "dayjs";

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
      last_modified: '',
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
    const items = await this.query().eq('folder', parent.path).list();
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
          last_modified: typeof item.lastModified === 'string' ? item.lastModified : dayjs(item.lastModified).format('YYYY-MM-DD HH:mm:ss'),
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

}