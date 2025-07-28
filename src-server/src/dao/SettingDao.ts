import {BaseMapper} from "@/modules/database/BaseMapper";
import {Setting} from "@/types/Setting";
import {Database} from "db0";
import {map} from "@/utils/ArrayUtil";
import {SettingConstantEnum, SettingConstants} from "@/enum/SettingConstantEnum";

export class SettingDao extends BaseMapper<Setting> {

  private readonly settingMap = new Map<string, any>();

  constructor(db: Database) {
    super(db, "setting");
  }

  async init() {
    const rows = await this.query().list();
    for (let row of rows) {
      this.settingMap.set(row.key, JSON.parse(row.value).value);
    }
  }

  async save(params: Record<string, any>) {
    const keys = Object.keys(params);
    const rows = await this.query().in('key', keys).list();
    const oldMap = map(rows, 'key');
    for (const paramKey in params) {
      if (!SettingConstants.includes(paramKey)) {
        // 不存在的键
        continue;
      }
      const old = oldMap.get(paramKey);
      // 刷新缓存
      this.settingMap.set(paramKey, params[paramKey]);
      const value = JSON.stringify({
        value: params[paramKey]
      });
      if (old) {
        // 存在旧的
        await this.updateById(old.id, {
          value,
          update_time: Date.now()
        })
      } else {
        await this.insert({
          key: paramKey,
          value,
          create_time: Date.now(),
          update_time: Date.now(),
        })
      }
    }
  }

  async globalAll() {
    return this.settingMap.entries().reduce((pre, currentValue) => {
      const [key, value] = currentValue;
      pre[key] = value;
      return pre;
    }, {} as Record<string, any>);
  }

  async get<T>(k: SettingConstantEnum): Promise<T | null> {
    const val = this.settingMap.get(k);
    if (val) return val;
    const target = await this.query().eq('key', k).one();
    if (target) {
      const value = JSON.parse(target.value).value;
      this.settingMap.set(k, value);
      return value;
    }
    return null;
  }


}