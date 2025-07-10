import {VideoPluginForCmsProps} from "@/modules/video/impl/cms/VideoPluginForCms";
import {SelectOption} from "tdesign-vue-next";
import {VideoPluginForJellyfinProps} from "@/modules/video/impl/jellyfin/VideoPluginForJellyfin";
import {VideoPluginForEmbyProps} from "@/modules/video/impl/emby/VideoPluginForEmby";

export type VideoSourceType = {
  'CMS:JSON': VideoPluginForCmsProps,
  JELLYFIN: VideoPluginForJellyfinProps,
  EMBY: VideoPluginForEmbyProps
}
export type VideoSourceTypeName = keyof VideoSourceType;

export const videoSourceTypeOptions: Array<SelectOption> = [{
  label: 'CMS (JSON)',
  value: 'CMS:JSON'
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
}

export type VideoSourceEntry = VideoSource<VideoSourceTypeName>;