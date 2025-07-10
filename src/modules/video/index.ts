import {VideoSource, VideoSourceEntry} from "@/entities/VideoSource";
import {VideoPlugin} from "@/modules/video/VideoPlugin";
import {VideoPluginForCms} from "@/modules/video/impl/cms/VideoPluginForCms";
import {VideoPluginForJellyfin} from "@/modules/video/impl/jellyfin/VideoPluginForJellyfin";
import {VideoPluginForEmby} from "@/modules/video/impl/emby/VideoPluginForEmby";

export function buildVideoPlugin(source: VideoSourceEntry): VideoPlugin {
  if (source.type === 'CMS:JSON') {
    return new VideoPluginForCms(source as VideoSource<'CMS:JSON'>);
  } else if (source.type === 'JELLYFIN') {
    return new VideoPluginForJellyfin(source as VideoSource<'JELLYFIN'>);
  } else if (source.type === 'EMBY') {
    return new VideoPluginForEmby(source as VideoSource<'EMBY'>);
  } else {
    throw new Error('Unknown video video-source type: ' + source.type);
  }
}
