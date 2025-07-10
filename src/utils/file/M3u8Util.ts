import {useGet} from "@/hooks/HttpRequest";
import {trim} from "radash";
import {M3u8Group, M3u8Channel} from "@/entities/LiveSource";
import {useSnowflake} from "@/hooks/Snowflake";


export async function getM3u8Channel(url: string): Promise<Array<M3u8Channel>> {
  const items = new Array<M3u8Channel>();

  const response = await useGet<string>(url, null, {responseType: 'text'});
  const body = response.data;
  const lines = body.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("#EXTM3U")) {
      continue;
    }
    if (line.startsWith("#EXTINF:-1")) {
      const split1 = line.split(",");
      const strings = split1[0].split(" ");
      const item: M3u8Channel = {
        name: trim(split1[1], '\r'),
        url: trim(lines[i + 1], '\r'),
        group: '',
        logo: '',
        id: useSnowflake().nextId()
      };
      for (let string of strings) {
        let split = string.split("=");
        const key = split[0];
        const value = trim(split[1], '"');
        switch (key) {
          case 'group-title':
            item['group'] = value;
            break;
          case 'tvg-logo':
            item['logo'] = value;
        }
      }
      items.push(item);
    }
  }
  return items;
}

export function channelsToGroup(items: Array<M3u8Channel>): Array<M3u8Group> {

  const groupMap = new Map<string, M3u8Group>();

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
