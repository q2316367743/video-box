import {VideoSourceEntry} from "@/entities/VideoSource";
import {VideoPlugin} from "@/core/VideoPlugin";
import {VideoPluginForCms, VideoPluginForCmsProps} from "@/core/impl/cms/VideoPluginForCms";

export function buildVideoPlugin(source: VideoSourceEntry): VideoPlugin {
  if (source.type === 'CMS') {
    return new VideoPluginForCms(source.id, source.props as VideoPluginForCmsProps);
  }else {
    throw new Error('Unknown video source type: ' + source.type);
  }
}