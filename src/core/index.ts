import {VideoSourceEntry} from "@/entities/VideoSource";
import {VideoPlugin} from "@/core/VideoPlugin";
import {VideoPluginForCms} from "@/core/impl/cms/VideoPluginForCms";

export function buildVideoPlugin(source: VideoSourceEntry): VideoPlugin {
  if (source.type === 'CMS') {
    return new VideoPluginForCms(source);
  } else {
    throw new Error('Unknown video source type: ' + source.type);
  }
}
