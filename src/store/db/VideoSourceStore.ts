import {defineStore} from "pinia";
import {VideoSourceEntry} from "@/entities/VideoSource.js";
import {listByAsync, saveListByAsync} from "@/utils/utools/DbStorageUtil.js";
import {LocalNameEnum} from "@/global/LocalNameEnum.js";
import {map} from "@/utils/lang/ArrayUtil.js";
import {fetchFavicon} from "@/utils/file/HttpUtil.js";
import {useSnowflake} from "@/hooks/Snowflake.js";

async function getFavicon(url: string, icon: string, iconType: number) {
  let favicon = '';
  switch (iconType) {
    case 1:
      // 自动获取
      favicon = await fetchFavicon(url);
      break;
    case 2:
      favicon = '';
      break;
    case 3:
      favicon = icon;
      break;
  }
  return favicon;
}

export const useVideoSourceStore = defineStore('source', () => {
  const sources = ref<Array<VideoSourceEntry>>([])
  const rev = ref<string>();

  const sourceMap = computed(() => map(sources.value, 'id'));

  const init = async () => {
    const res = await listByAsync<VideoSourceEntry>(LocalNameEnum.LIST_SOURCE_VIDEO);
    sources.value = res.list;
    rev.value = res.rev;
  }

  const add = async (source: VideoSourceEntry, iconType: number) => {
    if (!source.title) return Promise.reject(new Error("网络资源标题不能为空"));
    if (!source.props.url) return Promise.reject(new Error("请输入网站链接"));
    let favicon = await getFavicon(source.props.url, source.favicon, iconType);
    const now = Date.now();
    sources.value.push({
      id: useSnowflake().nextId(),
      createTime: now,
      updateTime: now,
      title: source.title,
      type: source.type,
      props: source.props,
      favicon,
      // 导入的都是根目录
      folder: '',
      order: now
    });
    rev.value = await saveListByAsync(LocalNameEnum.LIST_SOURCE_VIDEO, sources.value, rev.value);
  }

  const remove = async (id: string) => {
    sources.value = sources.value.filter(item => item.id !== id);
    rev.value = await saveListByAsync(LocalNameEnum.LIST_SOURCE_VIDEO, sources.value, rev.value);
  }
  const update = async (res: Partial<Omit<VideoSourceEntry, 'id'>> & Pick<VideoSourceEntry, 'id'>, iconType?: number) => {
    const index = sources.value.findIndex(item => item.id === res.id);
    if (index !== -1) {
      let favicon = sources.value[index].favicon;
      if (res.props?.url && iconType) {
        console.log(res.props.url, res.favicon || '', iconType)
        favicon = await getFavicon(res.props.url, res.favicon || '', iconType);
      }
      sources.value[index] = {
        ...sources.value[index],
        ...res,
        updateTime: Date.now(),
        // 图标
        favicon

      };
      rev.value = await saveListByAsync(LocalNameEnum.LIST_SOURCE_VIDEO, sources.value, rev.value);
    }
  }

  return {sources, sourceMap, init, add, update, remove};
})