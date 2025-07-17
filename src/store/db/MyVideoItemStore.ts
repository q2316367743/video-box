import {defineStore} from "pinia";
import {MyVideoItem, MyVideoItemForm} from "@/entities/MyVideoItem.ts";
import {
  listByAsync,
  saveListByAsync,
} from "@/utils/utools/DbStorageUtil.js";
import {LocalNameEnum} from "@/global/LocalNameEnum.js";
import {set} from "@/utils/lang/ArrayUtil.js";

export const useMyVideoItemStore = defineStore('playHistoryStore', () => {
  const playHistoryItems = ref<Array<MyVideoItem>>([]);
  const rev = ref<string>();
  const ids = computed(() => set(playHistoryItems.value, 'id'));

  const init = () => listByAsync(LocalNameEnum.LIST_MY_VIDEO).then(res => {
    playHistoryItems.value = res.list;
    rev.value = res.rev;
  });

  const add = async (data: MyVideoItemForm) => {
    const id = `${data.type}/${data.from}/${data.payload}`;
    if (ids.value.has(id)) return;
    // 去重
    playHistoryItems.value.push({
      ...data,
      createTime: Date.now(),
      id,
    });
    rev.value = await saveListByAsync(LocalNameEnum.LIST_MY_VIDEO, playHistoryItems.value, rev.value);
  }

  const del = async (id: string) => {
    const idx = playHistoryItems.value.findIndex(e => e.id === id);
    if (idx > -1) {
      playHistoryItems.value.splice(idx, 1);
      rev.value = await saveListByAsync(LocalNameEnum.LIST_MY_VIDEO, playHistoryItems.value, rev.value);
    }
  }

  return {playHistoryItems, init, add, del};

})