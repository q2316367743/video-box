import {defineStore} from "pinia";
import {ref} from "vue";
import {LiveSource, M3u8Channel, M3u8Core, LiveSourceInfo} from "@/entities/LiveSource";
import {
  listByAsync,
  listRecordByAsync,
  removeMultiByAsync,
  saveListByAsync
} from "@/utils/utools/DbStorageUtil";
import {LocalNameEnum} from "@/global/LocalNameEnum";
import {getM3u8Channel} from "@/utils/file/M3u8Util";
import MessageUtil from "@/utils/modal/MessageUtil";
import {isEmptyString} from "@/utils/lang/FieldUtil";

const SIZE = 1000;

export const useLiveSourceStore = defineStore('live-source', () => {
  const liveSources = ref(new Array<LiveSource>());
  let rev: string | undefined = undefined;

  async function init() {
    const res = await listByAsync<LiveSource>(LocalNameEnum.LIST_SOURCE_LIVE);
    liveSources.value = res.list;
    rev = res.rev;
  }

  async function getChannel(id: number): Promise<LiveSourceInfo> {
    for (let m3u8 of liveSources.value) {
      if (m3u8.id === id) {
        const res = await listRecordByAsync<Array<M3u8Channel>>(LocalNameEnum.ITEM_SOURCE_LIVE_CHANNEL + id);
        return {
          ...m3u8,
          channels: res
            .sort((a, b) => a.id.localeCompare(b.id))
            .flatMap(e => e.record),
        }
      }
    }

    return Promise.reject(new Error(`链接【${id}】不存在`));
  }

  async function getChannels(ids: Array<number>): Promise<Array<LiveSourceInfo>> {
    const items = new Array<LiveSourceInfo>();
    for (let id of ids) {
      try {
        items.push(await getChannel(id));
      } catch (e) {
        console.error(e);
      }
    }
    return items;
  }

  // 刷新管道
  async function refreshChannels(id: number) {
    const index = liveSources.value.findIndex(e => e.id === id);
    if (index === -1) {
      return Promise.reject(new Error("订阅列表不存在"));
    }
    const channel = await getChannel(id);
    try {
      let items = await getM3u8Channel(channel.url);
      // 更新列表
      liveSources.value[index] = {
        ...liveSources.value[index],
        updateTime: Date.now(),
        length: items.length,
        success: true,
      }
      // 删除历史数据
      await removeMultiByAsync(LocalNameEnum.ITEM_SOURCE_LIVE_CHANNEL + id);

      // 保存数据
      const count = Math.ceil(items.length / SIZE);
      for (let i = 0; i < count; i++) {
        await saveListByAsync(LocalNameEnum.ITEM_SOURCE_LIVE_CHANNEL + id + '/' + `${i}`.padStart(3, '0'), items.slice(i * SIZE, Math.min((i + 1) * SIZE, items.length)));
      }
    } catch (e) {
      MessageUtil.error("获取数据失败", e);
      liveSources.value[index] = {
        ...liveSources.value[index],
        updateTime: Date.now(),
        success: true,
      }
    }
    // 保存列表
    rev = await saveListByAsync(LocalNameEnum.LIST_SOURCE_LIVE, liveSources.value, rev);
  }

  async function add(data: M3u8Core) {
    if (isEmptyString(data.url)) {
      return Promise.reject(new Error("暂时只支持订阅链接"));
    }
    liveSources.value.push({
      id: Date.now(),
      length: 0,
      success: false,
      updateTime: 0,
      name: data.name,
      url: data.url,
      disableTimeout: data.disableTimeout
    });
    rev = await saveListByAsync(LocalNameEnum.LIST_SOURCE_LIVE, liveSources.value, rev);
  }

  async function update(data: M3u8Core) {
    if (isEmptyString(data.url)) {
      return Promise.reject(new Error("暂时只支持订阅链接"));
    }
    const index = liveSources.value.findIndex(e => e.id === data.id);
    if (index === -1) {
      return Promise.reject(new Error("订阅列表不存在"));
    }
    // 更新列表
    liveSources.value[index] = {
      ...liveSources.value[index],
      updateTime: Date.now(),
      length: 0,
      success: false,
      name: data.name,
      url: data.url,
      disableTimeout: data.disableTimeout
    }
    // 保存数据
    rev = await saveListByAsync(LocalNameEnum.LIST_SOURCE_LIVE, liveSources.value, rev);
  }

  async function remove(id: number) {
    const index = liveSources.value.findIndex(e => e.id === id);
    if (index === -1) {
      return Promise.reject(new Error("订阅列表不存在"));
    }
    liveSources.value.splice(index, 1);
    // 保存数据
    rev = await saveListByAsync(LocalNameEnum.LIST_SOURCE_LIVE, liveSources.value, rev);
    // 删除频道列表
    await removeMultiByAsync(LocalNameEnum.ITEM_SOURCE_LIVE_CHANNEL + id, true);
  }

  return {liveSources, init, refreshChannels, getChannel, getChannels, add, update, remove}

});
