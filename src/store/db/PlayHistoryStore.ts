import {defineStore} from "pinia";
import {PlayHistoryContent, PlayHistoryItem, PlayHistoryPayload} from "@/entities/PlayHistoryItem.ts";
import {
  getFromOneByAsync,
  listByAsync,
  removeOneByAsync,
  saveListByAsync,
  saveOneByAsync
} from "@/utils/utools/DbStorageUtil.js";
import {LocalNameEnum} from "@/global/LocalNameEnum.js";

export const usePlayHistoryStore = defineStore('playHistoryStore', () => {
  const playHistoryItems = ref<Array<PlayHistoryItem>>([]);
  const rev = ref<string>();

  listByAsync(LocalNameEnum.LIST_HISTORY).then(res => {
    playHistoryItems.value = res.list;
    rev.value = res.rev;
  });

  const add = async <T>(data: PlayHistoryContent<T>) => {
    const {payload, ...item} = data;
    await saveOneByAsync<PlayHistoryPayload<T>>(LocalNameEnum.ITEM_HISTORY + data.id, {payload});
    playHistoryItems.value.push(item);
    rev.value = await saveListByAsync(LocalNameEnum.LIST_HISTORY, playHistoryItems.value, rev.value);
  }

  const getContent = async <T = any>(id: string): Promise<PlayHistoryContent<T>> => {
    const p = await getFromOneByAsync<PlayHistoryPayload<T>>(LocalNameEnum.ITEM_HISTORY + id);
    if (!p.record) return Promise.reject(new Error('Failed to get play history payload'));
    const i = playHistoryItems.value.find(e => e.id === id);
    if (!i) return Promise.reject(new Error('Failed to get play history item'));
    return {...i, ...p.record};
  }

  const del = async (id: string) => {
    const idx = playHistoryItems.value.findIndex(e => e.id === id);
    if (idx > -1) {
      playHistoryItems.value.splice(idx, 1);
      rev.value = await saveListByAsync(LocalNameEnum.LIST_HISTORY, playHistoryItems.value, rev.value);
    }
    await removeOneByAsync(LocalNameEnum.ITEM_HISTORY + id, true);
  }

  return {playHistoryItems, add, getContent, del};

})