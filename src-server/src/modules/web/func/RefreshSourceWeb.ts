import { useHead } from "@/global/http";
import { SourceWeb } from "@/types/SourceWeb";
import { updateById } from "@/utils/SqlUtil";
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
    await updateById('source_web', sourceWeb.id, {
      update_time: end,
      refresh_time: end,
      retry_count: 0,
      delay_time: end - start,
      is_enabled: 1,
    })
  } catch (error) {
    const now = Date.now();
    debug(`刷新「${sourceWeb.title}」失败：${error}`);
    await updateById('source_web', sourceWeb.id, {
      update_time: now,
      refresh_time: now,
      retry_count: sourceWeb.retry_count + 1,
      is_enabled: sourceWeb.is_enabled !== 0
        ? sourceWeb.retry_count + 1 < 3
          ? 1
          : 0
        : sourceWeb.is_enabled,
      delay_time: -1,
    })
  }

  return fetch(url);
}
