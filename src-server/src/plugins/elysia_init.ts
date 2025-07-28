import {runMigrations} from "@/plugins/migrate";
import {settingDao} from "@/dao";
import {error, info} from "@rasla/logify";

export async function elysiaInit() {
  // 执行数据库合并脚本
  info("执行数据库合并脚本")
  try {
    await runMigrations()
    info("✅ migrations applied");
  } catch (e) {
    error("❌ migrations failed");
  }
  // 执行字典初始化
  info("执行字典初始化")
  await settingDao.init();
}