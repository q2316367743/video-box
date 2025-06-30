import {VideoPluginForCmsProps} from "@/core/impl/cms/VideoPluginForCms";
import {SelectOption} from "tdesign-vue-next";

export type VideoSourceType = {
  CMS: VideoPluginForCmsProps
}
export type VideoSourceTypeName = keyof VideoSourceType;

export const videoSourceTypeOptions: Array<SelectOption> = [{
  label: 'CMS',
  value: 'CMS'
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