import { useGet } from "@/global/http";
import { SourceTvChannel } from "@/types/SourceTv";
import { trim } from "radash";
import { useSnowflake } from "../Snowflake";

export async function getM3u8Channel(
  url: string
): Promise<Array<SourceTvChannel>> {
  const items = new Array<SourceTvChannel>();
  const now = Date.now();

  const response = await useGet<string>(url, null, { responseType: "text" });
  const body = response.data;
  const lines = body.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("#EXTM3U")) {
      continue;
    }
    if (line.startsWith("#EXTINF:-1")) {
      const split1 = line.split(",");
      const strings = split1[0].split(" ");
      const item: SourceTvChannel = {
        name: trim(split1[1], "\r"),
        url: trim(lines[i + 1], "\r"),
        group: "",
        logo: "",
        id: useSnowflake().nextId(),
        create_time: now,
      };
      for (let string of strings) {
        let split = string.split("=");
        const key = split[0];
        const value = trim(split[1], '"');
        switch (key) {
          case "group-title":
            item["group"] = value;
            break;
          case "tvg-logo":
            item["logo"] = value;
        }
      }
      items.push(item);
    }
  }
  return items;
}
