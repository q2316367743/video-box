import { list } from "radash";
import { debug } from "@rasla/logify";
import { db } from "@/global/db";
import { useSnowflake } from "./Snowflake";

interface TableLike {
  id: string;
  [key: string]: any;
}

/**
 * 列表查询
 * @param tableName 表名
 * @param params 查询参数
 * @returns 查询结果
 */
export async function selectList<T extends TableLike>(
  tableName: string,
  params: Partial<T> = {}
): Promise<Array<T>> {
  const query = new Array<string>();
  const values = new Array<any>();
  for (const key in params) {
    const value = params[key];
    // 如果值不存在，则不查询
    if (value === null || typeof value === "undefined") continue;
    query.push(`\`${key}\` = ?`);
    values.push(value);
  }
  let sql: string;
  if (Object.keys(query).length === 0) {
    sql = `select * from ${tableName}`;
  } else {
    sql = `select * from ${tableName} where ${query.join(" and ")}`;
  }
  debug("select sql:\t\t" + sql);
  const statement = db.prepare(sql);
  debug("select values:\t" + values);
  return (await statement.all(...values)) as Array<T>;
}

export async function getOne<T extends TableLike>(
  tableName: string,
  params: Partial<T> = {}
): Promise<T | null> {
  const list = await selectList<T>(tableName, params);
  if (list.length === 0) {
    return null;
  }
  return list[0];
}

export async function selectFirst<T extends TableLike>(
  tableName: string,
  params: Partial<T> = {}
): Promise<T | null> {
  const list = await selectList<T>(tableName, params);
  if (list.length === 0) {
    return null;
  }
  return list[0];
}

export async function selectById<T extends TableLike>(
  tableName: string,
  id: string
): Promise<T | null> {
  const statement = db.prepare(`select * from ${tableName} where id = ?`);
  const target = (await statement.get(id)) as T;
  return target || null;
}

export async function updateById<T extends TableLike>(
  tableName: string,
  id: string,
  params: Partial<T>
) {
  const query = new Array<string>();
  const values = new Array<any>();
  for (const key in params) {
    query.push(`\`${key}\` = ?`);
    values.push(params[key]);
  }
  if (query.length === 0) {
    // 没有更新的
    return;
  }
  const sql = `update ${tableName} set ${query.join(", ")} where id = ?`;
  debug("update sql:\t\t" + sql);
  debug("update values:\t" + values);
  const statement = db.prepare(sql);
  const r = await statement.run(...values, id);
  debug("update result:\t" + r.success);
}

export async function deleteById(tableName: string, id: string) {
  const statement = db.prepare(`delete from ${tableName} where id = ?`);
  return statement.run(id);
}

export async function insert<T extends TableLike>(
  tableName: string,
  params: Partial<Omit<T, "id">>
) {
  const query = new Array<string>();
  const values = new Array<any>();
  for (const key in params) {
    query.push(`${key}`);
    values.push(params[key]);
  }
  const statement = db.prepare(
    `insert into ${tableName} (id, ${query.join(", ")}) values (?, ${list(
      0,
      query.length,
      "?"
    ).join(", ")})`
  );
  return statement.run(useSnowflake().nextId(), ...values);
}
