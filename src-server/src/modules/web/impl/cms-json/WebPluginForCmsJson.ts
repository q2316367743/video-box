import {AbsWebPluginForStore} from "@/modules/web/abs/AbsWebPluginForStore.js";
import {
  WebCategoryResult,
  WebDetail,
  WebHome, WebListItem, WebListItemChapter,
  WebSearchResult
} from "@/modules/web/WebPlugin";
import {CmsHomeResult, CmsWebList} from "@/modules/web/impl/cms-json/WebTypeForCmsJson";
import {SourceWeb} from "@/types/SourceWeb";
import {cmsTreeTransfer} from "@/modules/web/common/CmsUtil";
import { useGet } from "@/global/http";

export interface WebPluginForCmsJsonProps {
  url: string;
}

export class WebPluginForCmsJson extends AbsWebPluginForStore {

  public props: SourceWeb;
  private readonly url: string;

  constructor(props: SourceWeb) {
    super(props.id);
    this.props = props;
    this.url = props.props.url;
  }

  private async cToL(params: Record<string, any>): Promise<WebCategoryResult> {
    const {data} = await useGet<CmsWebList>(this.url, params);
    return {
      limit: Number(data.limit),
      page: Number(data.page),
      total: Number(data.total),
      data: data.list?.map(e => {
        const chapters = new Array<WebListItemChapter>();
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
          types: e.vod_tag?.split(',') || [],
          actors: e.vod_actor?.split(',') || [],
          directors: e.vod_director?.split(',') || [],
          writers: e.vod_writer?.split(',') || [],
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

  async getDetail(video: WebListItem | string): Promise<WebDetail> {
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

  async home(page: number): Promise<WebHome> {
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
      categories: data.class ? cmsTreeTransfer(data.class) : []
    }
  }

  async getWebs(categoryId: string, page: number): Promise<WebCategoryResult> {
    // https://caiji.dyttzyapi.com/api.php/provide/vod?ac=videolist&t=&pg=
    return this.cToL({
      ac: 'videolist',
      t: categoryId,
      pg: page
    });
  }

  async searchWebs(keyword: string, page: number): Promise<WebSearchResult> {
    return this.cToL({
      ac: 'videolist',
      wd: keyword,
      pg: page
    });
  }


}