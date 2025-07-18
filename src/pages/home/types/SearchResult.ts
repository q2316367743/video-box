import {VideoSourceEntry} from "@/entities/VideoSource.js";
import {VideoListItem, VideoPlugin} from "@/modules/video/VideoPlugin.js";

export interface SearchResultItem {
  source: VideoSourceEntry;
  item: VideoListItem;
  plugin: VideoPlugin;
}

export interface SearchResultDisplay {
  cover: string;
  title: string;
  remark: string;

}

export interface SearchResult extends SearchResultDisplay {

  results: Array<SearchResultItem>;

}