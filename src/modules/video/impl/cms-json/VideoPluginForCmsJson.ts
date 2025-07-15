import {AbsVideoPluginForStore} from "@/modules/video/abs/AbsVideoPluginForStore.js";
import {
  VideoCategoryResult,
  VideoDetail,
  VideoHome, VideoListItem, VideoListItemChapter,
  VideoSearchResult
} from "@/modules/video/VideoPlugin.js";
import {CmsHomeResult, CmsVideoList} from "@/modules/video/impl/cms-json/VideoTypeForCmsJson.js";
import {VideoSource} from "@/entities/VideoSource.js";
import {useGet} from "@/hooks/HttpRequest.js";
import {cmsTreeTransfer} from "@/modules/video/common/CmsUtil.js";

export interface VideoPluginForCmsJsonProps {
  url: string;
}

export class VideoPluginForCmsJson extends AbsVideoPluginForStore {

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
      data: data.list?.map(e => {
        const chapters = new Array<VideoListItemChapter>();
        if (e.vod_play_note) {
          const chapterNames = e.vod_play_from.split(e.vod_play_note);
          e.vod_play_url.split(e.vod_play_note).forEach((e, i) => {
            chapters.push({
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
          chapters.push({
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
          types: e.vod_tag.split(','),
          actors: e.vod_actor.split(','),
          directors: e.vod_director.split(','),
          writers: e.vod_writer.split(','),
          remark: e.vod_remarks,
          releaseDate: e.vod_pubdate,
          total: e.vod_total,
          region: e.vod_area,
          language: e.vod_lang,
          releaseYear: e.vod_year,
          duration: e.vod_duration,
          content: e.vod_content,
          chapters
        }
      }) || []
    }
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
      categories: cmsTreeTransfer(data.class)
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