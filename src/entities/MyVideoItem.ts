export interface MyVideoItemCore {
  // watched-看过，liked-喜欢，following-在追
  type: 'watched' | 'liked' | 'following'
  // 来源：disk-本地，web-网络，tv-电视
  from: 'disk' | 'web' | 'tv';
  // 附加数据，一般是ID，一个类型的payload要唯一
  payload: string;

}

export interface MyVideoItemForm extends MyVideoItemCore {

  cover: string;
  title: string;
  // 描述
  description: string;

  // 进度，只有在追的有
  progress?: number;
}

/**
 * 播放历史项
 */
export interface MyVideoItem extends MyVideoItemForm {
  // /${type}/${from}/${payload}
  id: string;
  createTime: number;
}