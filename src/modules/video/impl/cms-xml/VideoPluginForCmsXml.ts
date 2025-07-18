import {XMLParser} from 'fast-xml-parser';
import {AbsVideoPluginForStore} from "@/modules/video/abs/AbsVideoPluginForStore.ts";
import {
  VideoCategoryResult,
  VideoDetail,
  VideoHome, VideoListItem, VideoListItemChapter,
  VideoSearchResult
} from "@/modules/video/VideoPlugin.js";
import {VideoSource} from "@/entities/VideoSource.js";
import {useGet} from "@/hooks/HttpRequest.js";
import {cmsTreeTransfer} from "@/modules/video/common/CmsUtil.js";

export interface VideoPluginForCmsXmlProps {
  url: string;
}

export class VideoPluginForCmsXml extends AbsVideoPluginForStore {

  public props: VideoSource<'CMS:XML'>;
  private readonly url: string;
  private readonly parser: XMLParser;

  constructor(props: VideoSource<'CMS:XML'>) {
    super(props.id);
    this.props = props;
    this.url = props.props.url;
    this.parser = new XMLParser({
      attributeNamePrefix: '@_',
      ignoreAttributes: false
    });
  }

  private async cToL(params: Record<string, any>): Promise<VideoCategoryResult> {
    const {data} = await useGet<string>(this.url, params, {
      responseType: 'text'
    });
    const xml = this.parser.parse(data);
    const list = xml.rss.list;
    return {
      limit: Number(list['@_pagesize']),
      page: Number(list['@_page']),
      total: Number(list['@_recordcount']),
      data: (list.video as Array<any>)?.map(e => {
        const chapters = new Array<VideoListItemChapter>();
          const dds: Array<any> = Array.isArray(e.dl.dd) ? e.dl.dd : [e.dl.dd];
          dds.forEach((dd) => {
            if (typeof dd === 'string') {
              chapters.push({
                id: this.props.id,
                name: this.props.title,
                items: dd.split('#').map(e => {
                  const temp = e.split('$');
                  return {
                    name: temp[0],
                    url: temp[1]
                  }
                })
              })
            }else {
              chapters.push({
                id: encodeURIComponent(dd['@_flag']),
                name: dd['@_flag'],
                items: (dd['#text'] as string).split('#').map(ddString => {
                  const temp = ddString.split('$');
                  return {
                    name: temp[0],
                    url: temp[1]
                  }
                })
              })
            }
          })
        return {
          id: e.id + '',
          type: 'Series',
          cover: e.pic,
          title: e.name,
          subtitle: e.sub || '',
          types: e.type.split(','),
          actors: e.actor.split(','),
          directors: e.director.split(','),
          writers: e.writer?.split(',') || [],
          remark: e.note,
          releaseDate: e.last || '',
          total: e.total || '',
          region: e.area,
          language: e.lang,
          releaseYear: e.year,
          duration: e.duration || '',
          content: e.des,
          chapters
        }
      }) || []
    }
  }

  async getDetail(video: VideoListItem | string): Promise<VideoDetail> {
    // https://caiji.dyttzyapi.com/api.php/provide/vod?ac=videolist&ids=48327
    const results = await this.cToL({
      ac: 'videolist',
      ids: typeof video === 'string' ? video : video.id
    })
    return {
      ...results.data[0],
      recommends: results.data.slice(1)
    };
  }

  async home(page: number): Promise<VideoHome> {
    const {data} = await useGet<string>(this.url, {
      ac: 'class',
      pg: page
    }, {responseType: 'text'});
    const xml = this.parser.parse(data);
    const list = xml.rss.list;
    return {
      limit: Number(list['@_pagesize']),
      page: Number(list['@_page']),
      total: Number(list['@_recordcount']),
      recommends: (list.video as Array<any>)?.map(e => ({
        id: e.id,
        cover: '',
        title: e.name,
        category: {
          id: e.tid,
          name: e.type,
          cover: '',
          children: []
        },
        titleEn: e.vod_en,
        time: e.last,
        playFrom: e.dt,
        remark: e.note
      })) || [],
      categories: cmsTreeTransfer((xml.rss.class.ty as Array<any>).map(t => ({
        type_id: t['@_id'],
        type_name: t['#text'],
        type_pid: t['@_pid']
      })))
    }
  }

  async getVideos(categoryId: string, page: number): Promise<VideoCategoryResult> {
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