import {VideoListItem} from "@/modules/video/VideoPlugin";
import {SourceWeb} from "@/views/SourceWeb";

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