import {VideoSourceEntry} from "@/entities/VideoSource.js";
import {VideoListItem, VideoPlugin} from "@/modules/video/VideoPlugin.js";
import {SourceWeb} from "@/views/SourceWeb.js";

export interface SearchResultItem {
  source: SourceWeb;
  item: VideoListItem;
}

export interface SearchResultDisplay {
  cover: string;
  title: string;
  remark: string;

}

export interface SearchResult extends SearchResultDisplay {

  results: Array<SearchResultItem>;

}