import {VideoSource, VideoSourceEntry} from "@/entities/VideoSource";
import {VideoPlugin} from "@/core/VideoPlugin";
import {VideoPluginForCms} from "@/core/impl/cms/VideoPluginForCms";
import {VideoPluginForJellyfin} from "@/core/impl/jellyfin/VideoPluginForJellyfin";
import {VideoPluginForEmby} from "@/core/impl/emby/VideoPluginForEmby";

export function buildVideoPlugin(source: VideoSourceEntry): VideoPlugin {
  if (source.type === 'CMS') {
    return new VideoPluginForCms(source as VideoSource<'CMS'>);
  } else if (source.type === 'JELLYFIN') {
    return new VideoPluginForJellyfin(source as VideoSource<'JELLYFIN'>);
  } else if (source.type === 'EMBY') {
    return new VideoPluginForEmby(source as VideoSource<'EMBY'>);
  } else {
    throw new Error('Unknown video source type: ' + source.type);
  }
}
