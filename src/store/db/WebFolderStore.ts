import {defineStore} from "pinia";
import type {Folder} from "@/entities/Folder.ts";
import {listByAsync, saveListByAsync} from "@/utils/utools/DbStorageUtil.ts";
import {LocalNameEnum} from "@/global/LocalNameEnum.ts";
import {useSnowflake} from "@/hooks/Snowflake.ts";

export const useWebFolderStore = defineStore('folderStore', () => {
  const webFolders = ref<Array<Folder>>([]);
  const rev = ref<string>();

  listByAsync(LocalNameEnum.LIST_FOLDER_VIDEO).then(res => {
    console.log(res)
    webFolders.value = res.list;
    rev.value = res.rev;
  });

  const post = async (name: string) => {
    const now = Date.now();
    webFolders.value.push({
      id: useSnowflake().nextId(),
      name,
      createTime: now,
      updateTime: now,
      order: now
    });
    rev.value = await saveListByAsync(LocalNameEnum.LIST_FOLDER_VIDEO, webFolders.value, rev.value);
  }
  const rename = async (id: string, name: string) => {
    const index = webFolders.value.findIndex(item => item.id === id);
    if (index !== -1) {
      webFolders.value[index].name = name;
      webFolders.value[index].updateTime = Date.now();
      rev.value = await saveListByAsync(LocalNameEnum.LIST_FOLDER_VIDEO, webFolders.value, rev.value);
    }
  }
  const sort = async (id: string, order: number) => {
    const index = webFolders.value.findIndex(item => item.id === id);
    if (index !== -1) {
      webFolders.value[index].order = order;
      webFolders.value[index].updateTime = Date.now();
      rev.value = await saveListByAsync(LocalNameEnum.LIST_FOLDER_VIDEO, webFolders.value, rev.value);
    }
  }
  const del = async (id: string) => {
    const index = webFolders.value.findIndex(item => item.id === id);
    if (index !== -1) {
      webFolders.value.splice(index, 1);
      rev.value = await saveListByAsync(LocalNameEnum.LIST_FOLDER_VIDEO, webFolders.value, rev.value);
    }
  }

  return {
    webFolders, post, rename, sort, del
  }

})