import {debug} from "@rasla/logify";
import {db} from "@/global/db";

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
    sql = `select *
           from ${tableName}`;
  } else {
    sql = `select *
           from ${tableName}
           where ${query.join(" and ")}`;
  }
  debug("select sql:\t\t" + sql);
  const statement = db.prepare(sql);
  debug("select values:\t" + values);
  return (await statement.all(...values)) as Array<T>;
}

/**
 * 开启事务
 * @param callback
 */
export async function beginTransactional<T = void>(callback: () => Promise<T>): Promise<T> {
  try {
    db.sql`BEGIN`;
    const t = await callback();
    db.sql`COMMIT`;
    return t;
  } catch (e) {
    console.error(e);
    db.sql`ROLLBACK`;
    throw e;
  }
}