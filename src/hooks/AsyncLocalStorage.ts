import MessageUtil from "@/utils/modal/MessageUtil.js";
import {useUtoolsDbAsync} from "@/hooks/UtoolsDbAsync.js";

interface AsyncLocalStorageResult<T> {
  data: ComputedRef<T | null>;
  loading: ComputedRef<boolean>;
  refresh: () => void;
}

/**
 * 异步初始化本地存储
 * @param key
 * @param initialFunc
 */
export const useAsyncLocalStorage = <T extends Record<string, any>>(key: string, initialFunc: () => Promise<T>): AsyncLocalStorageResult<T> => {
  const _data = useUtoolsDbAsync<T | null>(key, null, {
    onInitial: () => {
      if (_data.value === null) {
        refresh();
      }
    }
  });
  const _loading = ref(false);
  const refresh = () => {
    if (_loading.value) return;
    _loading.value = true;
    initialFunc()
      .then(res => _data.value = res)
      .catch(e => MessageUtil.error(`初始化「${key}」失败`, e))
      .finally(() => _loading.value = false);
  };
  const data = computed(() => _data.value);
  const loading = computed(() => _loading.value);
  return {data, loading, refresh};
}