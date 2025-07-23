// plugins/migrate.ts
import { APP_MIGRATION_DIR } from "@/global/constant";
import { db } from "@/global/db.js";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const dir = process.env.NODE_ENV === 'production' ? APP_MIGRATION_DIR : resolve(process.cwd(), "migrations");

async function getLatestVersion() {
  const { rows } =
    await db.sql`SELECT COALESCE(MAX(version), 0) AS version FROM schema_version;`;
  if (rows) {
    const row = rows[0];
    if (row) {
      const { version } = row;
      if (typeof version !== 'undefined' && version !== null) {
        return version as number;
      }
    }
  }
  return -1;
}

export async function runMigrations() {
  // 1. 检查 schema_version 表是否存在
  console.log("1. 检查 schema_version 表是否存在");
  const { rows } = await db.sql`
    SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version';
  `;
  if (!rows || !rows.length) {
    console.log("表不存在，创建 schema_version 表");
    await db.sql`
      CREATE TABLE schema_version (
        version int PRIMARY KEY,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;
  } else {
    console.log("表已存在，跳过创建");
  }

  // 2. 获取当前版本
  console.log("2. 获取当前版本");
  const current = await getLatestVersion();
  console.log("当前版本: ", current);
  const files = await readdir(dir);
  const pending = files
    .filter((f) => f.endsWith(".sql"))
    .map((f) => ({
      file: f,
      version: Number(f.match(/^(\d+)/)?.[1] || 0),
    }))
    .filter((m) => m.version > current)
    .sort((a, b) => a.version - b.version);

  for (const { file, version } of pending) {
    const sql = await readFile(resolve(dir, file), "utf8");
    console.log("开始处理文件：", file, ",版本：", version);
    await db.exec("BEGIN");
    try {
      console.log("执行sql文件");
      await db.exec(sql);
      console.log("插入版本");
      await db.sql`INSERT INTO schema_version(version) VALUES (${version})`;
      console.log("提交事务");
      await db.exec("COMMIT");
      console.info(`✅ migration ${file} applied`);
    } catch (e) {
      await db.exec("ROLLBACK");
      console.error(`❌ migration ${file} failed`, e);
      throw e;
    }
  }
}
