import {useGet} from "@/apis/common.ts";
import {useUserStore} from "@/store/UserStore.ts";

export async function pluginDiskLink(sourceId: string, path: string) {
  const link = await useGet<string>(`/api/plugin/disk/link/${sourceId}`, {path})
  if (link.startsWith('/api/proxy/url')) {
    const url = new URL(link, location.origin);
    const {token} = useUserStore();
    url.searchParams.set('authorization', token);
    return url.toString();
  }
  return link;
}