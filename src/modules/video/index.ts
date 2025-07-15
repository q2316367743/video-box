import {VideoSource, VideoSourceEntry} from "@/entities/VideoSource.js";
import {VideoPlugin} from "@/modules/video/VideoPlugin.js";
import {VideoPluginForCmsJson} from "@/modules/video/impl/cms-json/VideoPluginForCmsJson.js";
import {VideoPluginForCmsXml} from "@/modules/video/impl/cms-xml/VideoPluginForCmsXml.js";
import {VideoPluginForJellyfin} from "@/modules/video/impl/jellyfin/VideoPluginForJellyfin.js";
import {VideoPluginForEmby} from "@/modules/video/impl/emby/VideoPluginForEmby.js";

export function buildVideoPlugin(source: VideoSourceEntry): VideoPlugin {
  if (source.type === 'CMS:JSON') {
    return new VideoPluginForCmsJson(source as VideoSource<'CMS:JSON'>);
  } else if (source.type === 'CMS:XML') {
    return new VideoPluginForCmsXml(source as VideoSource<'CMS:XML'>);
  }else if (source.type === 'JELLYFIN') {
    return new VideoPluginForJellyfin(source as VideoSource<'JELLYFIN'>);
  } else if (source.type === 'EMBY') {
    return new VideoPluginForEmby(source as VideoSource<'EMBY'>);
  } else {
    throw new Error('Unknown video video-source type: ' + source.type);
  }
}
