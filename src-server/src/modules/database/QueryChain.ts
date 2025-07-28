import {Database} from "db0";
import {list} from 'radash';
import {debug} from "@rasla/logify";

export class QueryChain<T extends Record<string, any>, K extends keyof T = keyof T> {
  private readonly db: Database;
  private readonly tableName: string;

  private readonly params = new Array<string>();
  private readonly values = new Array<T[K]>();
  private readonly orders = new Array<string>();
  private readonly lastExpress = new Array<string>();

  constructor(tableName: string, db: Database) {
    this.tableName = tableName;
    this.db = db;
  }

  public static from<T extends Record<string, any>>(tableName: string, db: Database, p?: Partial<T>): QueryChain<T> {
    const qw = new QueryChain<T>(tableName, db);
    if (typeof p !== 'undefined') {
      Object.entries(p).forEach(([k, v]) => {
        qw.simpleWhere(k, v, "=");
      });
    }
    return qw;
  }

  private simpleWhere(k: K, v: T[K], op: string) {
    if (typeof v === 'undefined' || v === null) return this;
    this.params.push(`\`${String(k)}\` ${op} ?`);
    this.values.push(v);
    return this;
  }

  eq(k: K, v: T[K]) {
    return this.simpleWhere(k, v, "=");
  }

  ge(k: K, v: T[K]) {
    return this.simpleWhere(k, v, ">=");
  }

  le(k: K, v: T[K]) {
    return this.simpleWhere(k, v, "<=");
  }

  gt(k: K, v: T[K]) {
    return this.simpleWhere(k, v, ">");
  }

  lt(k: K, v: T[K]) {
    return this.simpleWhere(k, v, "<");
  }

  order(k: K, order: "ASC" | "DESC") {
    this.orders.push(`\`${String(k)}\` ${order}`)
    return this;
  }

  orderByAsc(k: K) {
    return this.order(k, "ASC");
  }

  orderByDesc(k: K) {
    return this.order(k, "DESC");
  }

  lastSql(sql: string) {
    this.lastExpress.push(sql);
    return this;
  }

  in(k: K, sql: string | Array<T[K]>) {
    if (Array.isArray(sql)) {
      this.params.push(`\`${String(k)}\` in (${list(0, sql.length - 1, '?').join(",")})`);
      this.values.push(...sql);
    } else {
      this.params.push(`\`${String(k)}\` in (${sql})`);
    }
    return this;
  }

  async execQuery(tableName: string, db: Database) {
    let sql = `select *
               from \`${tableName}\``;
    if (this.params.length > 0) {
      sql += (' where ' + this.params.join(' and '))
    }
    if (this.orders.length > 0) {
      sql += (' order by ' + this.orders.join(', '))
    }
    if (this.lastExpress.length > 0) {
      sql += this.lastExpress.join(' ');
    }

    debug("select sql\t\t:" + sql);
    debug("select values\t:" + this.values);
    const statement = db.prepare(sql);
    const list = await statement.all(...this.values);
    return list as Array<T>;
  }

  list(): Promise<Array<T>> {
    return this.execQuery(this.tableName, this.db)
  }

  async first(): Promise<T | null> {
    this.lastSql("LIMIT 1");
    const list = await this.execQuery(this.tableName, this.db);
    return list.length > 0 ? list[0] : null;
  }

  async one(): Promise<T | null> {
    this.lastSql("LIMIT 1");
    const list = await this.execQuery(this.tableName, this.db);
    if (list.length > 1) return Promise.reject(new Error("存在多个数据"));
    return list.length > 0 ? list[0] : null;
  }

}