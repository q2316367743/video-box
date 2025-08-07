import {exists, mkdir} from 'node:fs/promises'
import {runMigrations} from "@/plugins/migrate";
import {settingDao} from "@/dao";
import {error, info} from "@rasla/logify";
import {loadCron} from "@/plugins/scheduler";
import {APP_FILE_DIR, APP_LOG_DIR, APP_TEMP_DIR} from "@/global/constant";

export async function elysiaInit() {
  // 判断目录是否存在
  for (let path of [APP_TEMP_DIR, APP_FILE_DIR, APP_LOG_DIR]) {
    if (!await exists(path)) {
      info(`➖ 创建目录 ${path}`);
      await mkdir(path);
      info(`✅ 目录 ${path} 创建成功`);
    }
  }
  // 执行数据库合并脚本
  info("➖ 执行数据库合并脚本")
  try {
    await runMigrations()
    info("✅ migrations applied");
  } catch (e) {
    error("❌ migrations failed");
  }
  // 执行字典初始化
  info("➖ 执行字典初始化")
  await settingDao.init();
  info("➖ 启动定时任务")
  await loadCron();
}