import {SelectOption} from "tdesign-vue-next";
import {VideoPluginForCmsJsonProps} from "@/modules/video/impl/cms-json/VideoPluginForCmsJson.ts";
import {VideoPluginForJellyfinProps} from "@/modules/video/impl/jellyfin/VideoPluginForJellyfin.ts";
import {VideoPluginForEmbyProps} from "@/modules/video/impl/emby/VideoPluginForEmby.ts";
import {VideoPluginForCmsXmlProps} from "@/modules/video/impl/cms-xml/VideoPluginForCmsXml.js";
import {useSnowflake} from "@/hooks/Snowflake.ts";
import {fetchFavicon} from "@/utils/file/HttpUtil.ts";

export type VideoSourceType = {
  'CMS:JSON': VideoPluginForCmsJsonProps,
  'CMS:XML': VideoPluginForCmsXmlProps,
  JELLYFIN: VideoPluginForJellyfinProps,
  EMBY: VideoPluginForEmbyProps
}
export type VideoSourceTypeName = keyof VideoSourceType;

export const videoSourceTypeOptions: Array<SelectOption> = [{
  label: 'CMS (JSON)',
  value: 'CMS:JSON'
}, {
  label: 'CMS (XML)',
  value: 'CMS:XML'
}, {
  label: 'Emby',
  value: 'EMBY'
}]

export interface VideoSource<K extends VideoSourceTypeName> {
  id: string;
  createTime: number;
  updateTime: number;
  title: string;
  type: K;
  props: VideoSourceType[K];

  // 图标
  favicon: string;
  // 所在文件夹
  folder: string;
  // 排序
  order: number;
}

export type VideoSourceEntry = VideoSource<VideoSourceTypeName>;

export async function importVideoSourceEntry(source: Record<string, any>): Promise<VideoSourceEntry> {
  if (!source.props) return Promise.reject(new Error("Missing source.props"));
  if (!source.type) return Promise.reject(new Error("Missing source.type"));
  if (!source.title) return Promise.reject(new Error("Missing source.title"));
  if (!source.props.url) return Promise.reject(new Error("请输入网站链接"));
  const favicon = source.favicon || await fetchFavicon(source.props.url);
  const now = Date.now();
  return {
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
  }
}