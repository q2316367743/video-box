export enum MyVideoItemFromEnum {
  DISK = 1,
  WEB = 2,
  TV = 3,
}
export enum MyVideoItemTypeEnum {
  WATCHED = 1,
  LIKED = 2,
  FOLLOWING = 3,
}

export interface MyVideoItemCore {
  // 1-看过，2-喜欢，3-在追
  type: MyVideoItemTypeEnum;
  // 来源：1-本地，2-网络，3-电视
  from: MyVideoItemFromEnum;
  // 附加数据，一般是ID，一个类型的payload要唯一
  payload: string;
}

export interface MyVideoItemForm extends MyVideoItemCore {
  cover: string;
  title: string;
  // 描述
  description: string;
}

/**
 * 播放历史项
 */
export interface MyVideoItemView extends MyVideoItemForm {
  id: string;
  create_time: number;
  update_time: number;
}
