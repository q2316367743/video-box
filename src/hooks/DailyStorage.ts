import dayjs from 'dayjs';
import MessageUtil from "@/utils/modal/MessageUtil.js";
import {useUtoolsDbAsync} from "@/hooks/UtoolsDbAsync.js";

interface DailyStorageValue<T> {
  date: string;
  data: T;
}

interface DailyStorageResult<T> {
  data: ComputedRef<T | null>;
  loading: ComputedRef<boolean>;
  refresh: () => void;
}

/**
 * 异步初始化本地存储
 * @param key
 * @param initialFunc
 */
export const useDailyStorage = <T extends Record<string, any>>(key: string, initialFunc: () => Promise<T>): DailyStorageResult<T> => {
  const today = dayjs().format("YYYY-MM-DD");
  const _data = useUtoolsDbAsync<DailyStorageValue<T> | null>(key, null, {
    onInitial: () => {
      if (_data.value === null) {
        // 数据不存在，刷新
        refresh();
        return;
      }
      const {date} = _data.value;
      if (today !== date) {
        // 不是今天，也刷新
        refresh();
      }
    }
  });
  const _loading = ref(false);
  const refresh = () => {
    if (_loading.value) return;
    _loading.value = true;
    initialFunc()
      .then(res => _data.value = {
        data: res,
        date: today,
      })
      .catch(e => MessageUtil.error(`初始化「${key}」失败`, e))
      .finally(() => _loading.value = false);
  };
  const data = computed(() => _data.value?.data || null);
  const loading = computed(() => _loading.value);
  return {data, loading, refresh};
}