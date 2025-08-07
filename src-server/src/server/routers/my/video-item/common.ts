import { MyVideoItemCore } from "@/types/MyVideoItem";

export const buildId = (data: MyVideoItemCore) =>
  `${data.type}/${data.from}/${data.payload}`;
