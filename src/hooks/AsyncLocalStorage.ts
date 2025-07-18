import MessageUtil from "@/utils/modal/MessageUtil.js";

/**
 * 异步初始化本地存储
 * @param key
 * @param initialFunc
 */
export const useAsyncLocalStorage = <T>(key: string, initialFunc: () => Promise<T>): Ref<T | null> => {
  const data = useLocalStorage<T | null>(key, null);
  if (data.value === null) {
    initialFunc().then(res => data.value = res).catch(e => MessageUtil.error(`初始化「${key}」失败`, e));
  }
  return data;
}