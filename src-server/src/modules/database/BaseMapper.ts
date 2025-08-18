import {Database} from "db0";
import {debug} from "@rasla/logify";
import {selectList} from "@/utils/SqlUtil";
import {list} from "radash";
import {useSnowflake} from "@/utils/Snowflake";
import {QueryChain} from "@/modules/database/QueryChain";

interface TableLike extends Record<string, any> {
  id: string;
}

export class BaseMapper<T extends TableLike> {

  protected readonly db: Database;
  private readonly tableName: string;

  constructor(db: Database, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  async selectList(params?: Partial<T>): Promise<Array<T>> {
    let qw = QueryChain.from<T>(this.tableName, this.db, params);
    return qw.execQuery(this.db);
  }

  query(): QueryChain<T> {
    return new QueryChain<T>(this.tableName, this.db);
  }

  async getOne(params: Partial<T> = {}): Promise<T | null> {
    const list = await selectList<T>(this.tableName, params);
    if (list.length === 0) {
      return null;
    }
    return list[0];
  }

  async selectById(id: string): Promise<T | null> {
    const sql = `select *
                 from ${this.tableName}
                 where id = ?`
    const statement = this.db.prepare(sql);
    const target = (await statement.get(id)) as T;
    return target || null;
  }

  async updateById(id: string, params: Partial<T>) {
    const query = new Array<string>();
    const values = new Array<any>();
    for (const key in params) {
      const value = params[key];
      if (typeof value === 'undefined' || value === null) continue;
      query.push(`\`${key}\` = ?`);
      values.push(value);
    }
    if (query.length === 0) {
      // 没有更新的
      return;
    }
    const sql = `update ${this.tableName}
                 set ${query.join(", ")}
                 where id = ?`;
    debug("update sql:\t\t" + sql);
    debug("update values:\t" + values);
    const statement = this.db.prepare(sql);
    const r = await statement.run(...values, id);
    debug("update result:\t" + r.success);
  }

  async deleteById(id: string) {
    const sql = `delete
                 from ${this.tableName}
                 where id = ?`;
    const statement = this.db.prepare(sql);
    debug("delete sql:\t\t" + sql);
    debug("delete values:\t" + id);
    const r = await statement.run(id);
    debug("delete result:\t" + r.success);
  }

  async deleteByIds(ids: Array<string>) {
    const sql = `delete
                 from ${this.tableName}
                 where id in ${list(0, ids.length - 1, "?").join(", ")}`;
    const statement = this.db.prepare(sql);
    debug("delete sql:\t\t" + sql);
    debug("delete values:\t" + ids.join(', '));
    const r = await statement.run(...ids);
    debug("delete result:\t" + r.success);
  }

  async insert(params: Partial<Omit<T, "id">>) {
    const query = new Array<string>();
    const values = new Array<any>();
    for (const key in params) {
      if (key === "id") continue;
      query.push(`\`${key}\``);
      values.push(params[key]);
    }
    const sql = `insert into ${this.tableName} (id, ${query.join(
            ", "
    )})
                 values (${list(0, query.length, "?").join(", ")})`;
    debug("insert sql:\t\t" + sql);
    debug("insert values:\t" + values);
    const statement = this.db.prepare(sql);
    const id = useSnowflake().nextId();
    const r = await statement.run(id, ...values);
    debug("insert result:\t" + r.success);
    return {
      ...params,
      id
    } as T
  }

  async insertSelf(params: T) {
    const query = new Array<string>();
    const values = new Array<any>();
    for (const key in params) {
      query.push(`\`${key}\``);
      values.push(params[key]);
    }
    const sql = `insert into ${this.tableName} (${query.join(
            ", "
    )})
                 values (${list(0, query.length - 1, "?").join(", ")})`;
    debug("insert sql:\t\t" + sql);
    debug("insert values:\t" + values);
    const statement = this.db.prepare(sql);
    const r = await statement.run(...values);
    debug("insert result:\t" + r.success);
  }

}