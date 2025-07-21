import { SourceWebTypeEnum } from "@/enum/SourceWebTypeEnum";
import { SourceWeb } from "@/types/SourceWeb";
import { WebPlugin } from "./WebPlugin";
import { WebPluginForCmsJson } from "./impl/cms-json/WebPluginForCmsJson";
import { WebPluginForCmsXml } from "./impl/cms-xml/WebPluginForCmsXml";
import { WebPluginForEmby } from "./impl/emby/WebPluginForEmby";
import { WebPluginForJellyfin } from "./impl/jellyfin/WebPluginForJellyfin";

export function buildWebPlugin(source: SourceWeb): WebPlugin {
  if (source.type === SourceWebTypeEnum.CMS_JSON) {
    return new WebPluginForCmsJson(source);
  } else if (source.type === SourceWebTypeEnum.CMS_XML) {
    return new WebPluginForCmsXml(source);
  }else if (source.type === SourceWebTypeEnum.JELLYFIN) {
    return new WebPluginForJellyfin(source);
  } else if (source.type === SourceWebTypeEnum.EMBY) {
    return new WebPluginForEmby(source);
  } else {
    throw new Error('Unknown video video-source type: ' + source.type);
  }
}
