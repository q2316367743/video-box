import {defineStore} from "pinia";
import {VideoSourceEntry} from "@/entities/VideoSource";
import {listByAsync, saveListByAsync} from "@/utils/utools/DbStorageUtil";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {map} from "@/utils/lang/ArrayUtil";


export const useSourceStore = defineStore('source', () => {
  const sources = ref<Array<VideoSourceEntry>>([])
  const rev = ref<string>();

  const sourceOptions = computed(() => sources.value.map(s => ({
    value: s.id,
    label: s.title
  })));
  const sourceMap = computed(() =>  map(sources.value, 'id'));

  const init = async () => {
    const res = await listByAsync<VideoSourceEntry>(LocalNameEnum.LIST_SOURCE);
    sources.value = res.list;
    rev.value = res.rev;
  }

  const add = async (res: VideoSourceEntry) => {
    sources.value.push(res);
    rev.value = await saveListByAsync(LocalNameEnum.LIST_SOURCE, sources.value, rev.value);
  }

  const remove = async (res: VideoSourceEntry) => {
    sources.value = sources.value.filter(item => item.id !== res.id);
    rev.value = await saveListByAsync(LocalNameEnum.LIST_SOURCE, sources.value, rev.value);
  }
  const update = async (res: Partial<Omit<VideoSourceEntry, 'id'>> & Pick<VideoSourceEntry, 'id'>) => {
    const index = sources.value.findIndex(item => item.id === res.id);
    if (index !== -1) {
      sources.value[index] = {
        ...sources.value[index],
        ...res
      };
      rev.value = await saveListByAsync(LocalNameEnum.LIST_SOURCE, sources.value, rev.value);
    }
  }

  return {sources, sourceOptions, sourceMap, init, add, update, remove};
})