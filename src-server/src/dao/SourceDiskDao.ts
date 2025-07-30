import {BaseMapper} from "@/modules/database/BaseMapper";
import {DiskSourceEntry, DiskSourceForm, DiskSourceView} from "@/types/SourceDisk";
import {Database} from "db0";
import {DiskPlugin} from "@/modules/disk/DiskPlugin";
import {buildDiskPlugin} from "@/modules/disk";

export class SourceDiskDao extends BaseMapper<DiskSourceEntry> {

  private readonly cache = new Map<string, DiskPlugin>();

  constructor(db: Database) {
    super(db, 'source_disk');
  }

  async list(): Promise<Array<DiskSourceView>> {
    const list = await this.query().list();
    return list.map(e => ({
      ...e,
      data: JSON.parse(e.data)
    }))
  }

  async save(form: DiskSourceForm) {
    await this.insert({
      ...form,
      data: JSON.stringify(form.data)
    });
  }

  async update(id: string, params: DiskSourceForm): Promise<void> {
    await this.updateById(id, {
      ...params,
      data: JSON.stringify(params.data)
    });
    this.cache.delete(id);
  }

  async delete(id: string): Promise<void> {
    await this.deleteById(id);
    this.cache.delete(id);
  }

  async getPlugin(id: string): Promise<DiskPlugin | null> {
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }
    const entry = await this.selectById(id);
    if (!entry) {
      return null;
    }
    const plugin = buildDiskPlugin({
      ...entry,
      data: JSON.parse(entry.data)
    });
    this.cache.set(id, plugin);
    return plugin;
  }

}