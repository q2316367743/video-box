export interface SourceTvForm {
  name: string;
  url: string;
  timeout: number;
}

export interface SourceTv extends SourceTvForm{
  id: string;
  create_time: number;
  update_time: number;
  length: number;
  refresh_time: number;
  refresh_status: number;
}

/**
 * 一个直播视频
 */
export interface SourceTvChannel {
  id: string;
  create_time: number;
  logo: string;
  name: string;
  url: string;
  group: string;
}

export interface SourceTvInfo extends SourceTv {
  channels: Array<SourceTvChannel>;
}

export interface SourceTvChannelView extends SourceTvChannel {
  timeout: boolean;
}

export interface SourceTvGroup {
  group: string;
  items: Array<SourceTvChannel>;
}

export function channelsToGroup(items: Array<SourceTvChannel>): Array<SourceTvGroup> {

  const groupMap = new Map<string, SourceTvGroup>();

  for (let item of items) {
    let m3u8Group = groupMap.get(item.group);
    if (m3u8Group) {
      m3u8Group.items.push(item);
    } else {
      groupMap.set(item.group, {
        items: [item],
        group: item.group
      })
    }
  }
  groupMap.delete("");

  return Array.from(groupMap.values());
}
