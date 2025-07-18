import {useGet} from "@/hooks/HttpRequest.js";

export interface DouBanRecentHotResult {
  category: string;
  items: DouBanRecommendItem[];
  recommend_tags: DouBanRecommendTag[];
  tags: Tag[];
  total: number;
  type: string;
}

interface Tag {
  category: string;
  selected: boolean;
  title: string;
  types: Type[];
}

interface Type {
  selected: boolean;
  title: string;
  type: string;
}

export interface DouBanRecommendTag {
  category: string;
  selected: boolean;
  title: string;
  type: string;
}

export interface DouBanRecommendItem {
  card_subtitle: string;
  episodes_info: string;
  id: string;
  is_new: boolean;
  pic: Pic;
  rating: Rating;
  title: string;
  type: string;
  uri: string;
}

interface Rating {
  count: number;
  max: number;
  star_count: number;
  value: number;
}

interface Pic {
  large: string;
  normal: string;
}

export async function douBanRecentHotTv(limit: number, category?: string, type?: string) {
  // https://m.douban.com/rexxar/api/v2/subject/recent_hot/tv?limit=50&category=tv&type=tv
  const {data} = await useGet<DouBanRecentHotResult>(
    'https://m.douban.com/rexxar/api/v2/subject/recent_hot/tv',
    {limit, category, type}, {
      headers: {
        'Referer': 'https://movie.douban.com/',
        'Origin': 'https://movie.douban.com'
      }
    })
  return data;
}


export async function douBanRecentHotMovie(limit: number, category?: string, type?: string) {
  // https://m.douban.com/rexxar/api/v2/subject/recent_hot/movie?limit=50&category=tv&type=tv
  const {data} = await useGet<DouBanRecentHotResult>(
    'https://m.douban.com/rexxar/api/v2/subject/recent_hot/movie',
    {limit, category, type})
  return data;
}