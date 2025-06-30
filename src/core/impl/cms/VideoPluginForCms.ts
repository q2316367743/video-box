import {AbsVideoPluginForStore} from "@/core/abs/AbsVideoPluginForStore";
import {
  VideoCategory,
  VideoCategoryResult,
  VideoDetail,
  VideoHome, VideoListItem,
  VideoSearchResult
} from "@/core/VideoPlugin";
import {CmsHomeClass, CmsHomeResult, CmsVideoList} from "@/core/impl/cms/VideoTypeForCms";
import {group, MapWrapper} from "@/utils/lang/ArrayUtil";

export interface VideoPluginForCmsProps {
  url: string;
}

export class VideoPluginForCms extends AbsVideoPluginForStore {

  private readonly props: VideoPluginForCmsProps;
  private readonly url: string;

  constructor(id: string, props: VideoPluginForCmsProps) {
    super(id);
    this.props = props;
    this.url = props.url;
  }

  async getDetail(video: VideoListItem): Promise<VideoDetail> {
    // https://caiji.dyttzyapi.com/api.php/provide/vod?ac=videolist&ids=48327
    return Promise.resolve({recommends: [], ...video});
  }

  getVideos(categoryId: string, page: number): Promise<VideoCategoryResult> {
    return Promise.resolve({
      limit: 20,
      page: page,
      total: 0,
      data: []
    });
  }

  private cTC(c: CmsHomeClass): VideoCategory {
    return {
      id: c.type_id + '',
      name: c.type_name,
      cover: '',
      children: []
    }
  }

  private tree(c: Array<CmsHomeClass>): Array<VideoCategory> {
    const cGroupMap = group(c, 'type_pid');
    const _tree = (node: VideoCategory, map: MapWrapper<number | undefined, Array<CmsHomeClass>>) => {
      let nodes = cGroupMap.getOrDefault(Number(node.id), []);
      node.children = nodes.map(e => this.cTC(e))
      node.children.forEach(n => _tree(n, map));
    }
    const t = {
      id: '0',
      name: '',
      cover: '',
      children: []
    };
    _tree(t, cGroupMap);
    return [...t.children, ...cGroupMap.getOrDefault(undefined, []).map(e => this.cTC(e))];
  }

  async home(page: number): Promise<VideoHome> {
    const {data} = await window.preload.lib.axiosInstance.get<CmsHomeResult>(this.url, {
      params: {
        ac: 'class',
        pg: page
      }
    });
    return {
      limit: Number(data.limit),
      page: Number(data.page),
      total: Number(data.total),
      recommends: data.list.map(e => ({
        id: e.vod_id + '',
        cover: '',
        title: e.vod_name,
        category: {
          id: e.type_id + '',
          name: e.type_name,
          cover: '',
          children: []
        },
        titleEn: e.vod_en,
        time: e.vod_time,
        playFrom: e.vod_play_from
      })),
      categories: this.tree(data.class)
    }
  }

  async searchVideos(keyword: string, page: number): Promise<VideoSearchResult> {
    const {data} = await window.preload.lib.axiosInstance.get<CmsVideoList>(this.url, {
      params: {
        ac: 'videolist',
        wd: keyword
      }
    });
    return {
      limit: Number(data.limit),
      page: data.page,
      total: data.total,
      data: data.list.map(e => ({
        id: e.vod_id + '',
        cover: e.vod_pic,
        title: e.vod_name,
        subtitle: e.vod_sub,
        titleEn: e.vod_en,
        types: e.vod_tag.split(','),
        actors: e.vod_actor.split(','),
        directors: e.vod_director.split(','),
        writers: e.vod_writer.split(','),
        blurb: e.vod_blurb,
        remark: e.vod_remarks,
        releaseDate: e.vod_pubdate,
        total: e.vod_total,
        region: e.vod_area,
        language: e.vod_lang,
        releaseYear: e.vod_year,
        duration: e.vod_duration,
        content: e.vod_content,
        playUrls: e.vod_play_url.split("#").map(e => ({
          name: e.split('$')[0],
          url: e.split('$')[1]
        }))
      }))
    }
  }


}