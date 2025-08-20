import { SourceRandom, SourceRandomRecordType } from "@/types/SourceRandom";
import { useGet } from "../common";

export function pluginRandomList() {
  return useGet<Array<SourceRandom>>('/api/plugin/random/list');
}

export function pluginRandomGet(id: string, tag?: string) {
  return useGet<Array<SourceRandomRecordType>>(`/api/plugin/random/get/${id}`, {
    tag
  });
}