import { db } from "@/global/db";
import { useHead } from "@/global/http";
import { SourceWeb } from "@/types/SourceWeb";
import { debug } from "@rasla/logify";

export async function refreshSourceWeb(sourceWeb: SourceWeb) {
  const { url = "" } = JSON.parse(sourceWeb.props);
  if (!url) return Promise.reject("url不能为空");
  const start = Date.now();
  try {
    await useHead(url);
    const end = Date.now();
    debug(`刷新「${sourceWeb.title}」耗时：${end - start}ms`);
    // 更新
    await db.sql`update source_web set update_time = ${end}, refresh_time = ${end}, retry_count = 0, delay_time = ${
      end - start
    } where id = ${sourceWeb.id}`;
  } catch (error) {
    const now = Date.now();
    debug(`刷新「${sourceWeb.title}」失败：${error}`);
    await db.sql`update source_web set update_time = ${now}, refresh_time = ${now}, retry_count = ${
      sourceWeb.retry_count + 1
    }, delay_time = -1 where id = ${sourceWeb.id}`;
  }

  return fetch(url);
}
