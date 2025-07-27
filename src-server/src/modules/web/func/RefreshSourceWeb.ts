import {useHead} from "@/global/http";
import {SourceWeb} from "@/types/SourceWeb";
import {debug} from "@rasla/logify";
import {AxiosError} from "axios";
import {sourceWebDao} from "@/dao";

export async function refreshSourceWeb(sourceWeb: SourceWeb) {
  const {url = ""} = JSON.parse(sourceWeb.props);
  if (!url) return Promise.reject("url不能为空");
  const start = Date.now();
  const onSuccess = async () => {
    const end = Date.now();
    debug(`刷新「${sourceWeb.title}」耗时：${end - start}ms`);
    // 更新
    await sourceWebDao.updateById(sourceWeb.id, {
      update_time: end,
      refresh_time: end,
      retry_count: 0,
      delay_time: end - start,
      is_enabled: 1,
    })
  }
  const onError = async (error: AxiosError) => {
    const now = Date.now();
    debug(`刷新「${sourceWeb.title}」失败：${error}`);
    await sourceWebDao.updateById(sourceWeb.id, {
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
  try {
    await useHead(url);
    await onSuccess()
  } catch (error) {
    const err = error as AxiosError;
    if (err.status === 404) await onSuccess();
    else await onError(err);
  }

  return fetch(url);
}
