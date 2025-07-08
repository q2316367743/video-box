import {VideoPluginForCmsProps} from "@/core/impl/cms/VideoPluginForCms";
import {SelectOption} from "tdesign-vue-next";
import {VideoPluginForJellyfinProps} from "@/core/impl/jellyfin/VideoPluginForJellyfin";
import {VideoPluginForEmbyProps} from "@/core/impl/emby/VideoPluginForEmby";

export type VideoSourceType = {
  CMS: VideoPluginForCmsProps,
  JELLYFIN: VideoPluginForJellyfinProps,
  EMBY: VideoPluginForEmbyProps
}
export type VideoSourceTypeName = keyof VideoSourceType;

export const videoSourceTypeOptions: Array<SelectOption> = [{
  label: 'CMS',
  value: 'CMS'
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