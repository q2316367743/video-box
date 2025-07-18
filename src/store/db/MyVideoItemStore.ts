import {defineStore} from "pinia";
import {MyVideoItem, MyVideoItemCore, MyVideoItemForm} from "@/entities/MyVideoItem.ts";
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

  // 构建ID
  const buildId = (data: MyVideoItemCore) => `${data.type}/${data.from}/${data.payload}`;
  const exists = (data: MyVideoItemCore): boolean => ids.value.has(buildId(data));

  const post = async (data: MyVideoItemForm) => {
    const id = buildId(data);
    if (ids.value.has(id)) {
      // 如果存在，则删除旧的
      const index = playHistoryItems.value.findIndex(e => e.id === id);
      if (index > -1) {
        playHistoryItems.value.splice(index, 1);
      }
    }
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

  return {playHistoryItems, init, exists, post, del};

})