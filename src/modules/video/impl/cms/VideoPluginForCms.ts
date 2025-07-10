import {AbsVideoPluginForStore} from "@/modules/video/abs/AbsVideoPluginForStore";
import {
  VideoCategory,
  VideoCategoryResult,
  VideoDetail,
  VideoHome, VideoListItem, VideoListItemChapter,
  VideoSearchResult
} from "@/modules/video/VideoPlugin";
import {CmsHomeClass, CmsHomeResult, CmsVideoList} from "@/modules/video/impl/cms/VideoTypeForCms";
import {group, MapWrapper} from "@/utils/lang/ArrayUtil";
import {VideoSource} from "@/entities/VideoSource";
import {useGet} from "@/hooks/HttpRequest";

export interface VideoPluginForCmsProps {
  url: string;
}

export class VideoPluginForCms extends AbsVideoPluginForStore {

  public props: VideoSource<'CMS:JSON'>;
  private readonly url: string;

  constructor(props: VideoSource<'CMS:JSON'>) {
    super(props.id);
    this.props = props;
    this.url = props.props.url;
  }

  async getDetail(video: VideoListItem): Promise<VideoDetail> {
    // https://caiji.dyttzyapi.com/api.php/provide/vod?ac=videolist&ids=48327
    return Promise.resolve({recommends: [], ...video});
  }

  private async cToL(params: Record<string, any>): Promise<VideoCategoryResult> {
    const {data} = await useGet<CmsVideoList>(this.url, params);
    return {
      limit: Number(data.limit),
      page: Number(data.page),
      total: Number(data.total),
      data: data.list.map(e => {
        const playUrls = new Array<VideoListItemChapter>();
        if (e.vod_play_note) {
          const chapterNames = e.vod_play_from.split(e.vod_play_note);
          e.vod_play_url.split(e.vod_play_note).forEach((e, i) => {
            playUrls.push({
              id: encodeURIComponent(chapterNames[i]),
              name: chapterNames[i],
              items: e.split('#').map(e => {
                const temp = e.split('$');
                return {
                  name: temp[0],
                  url: temp[1]
                }
              })
            })
          })
        } else {
          playUrls.push({
            id: encodeURIComponent(this.props.title),
            name: this.props.title,
            items: e.vod_play_url.split('#').map(e => {
              const temp = e.split('$');
              return {
                name: temp[0],
                url: temp[1]
              }
            })
          })
        }
        return {
          id: e.vod_id + '',
          type: 'Series',
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
          playUrls
        }
      })
    }
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
    const {data} = await useGet<CmsHomeResult>(this.url, {
      ac: 'class',
      pg: page
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

  async getVideos(categoryId: string, page: number): Promise<VideoCategoryResult> {
    // https://caiji.dyttzyapi.com/api.php/provide/vod?ac=videolist&t=&pg=
    return this.cToL({
      ac: 'videolist',
      t: categoryId,
      pg: page
    });
  }

  async searchVideos(keyword: string, page: number): Promise<VideoSearchResult> {
    return this.cToL({
      ac: 'videolist',
      wd: keyword,
      pg: page
    });
  }


}