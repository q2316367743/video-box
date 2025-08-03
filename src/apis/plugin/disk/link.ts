import {useGet, usePut} from "@/apis/common.ts";
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

export async function pluginDiskRename(sourceId: string, path: string, name: string) {
  return usePut(`/api/plugin/disk/rename/${sourceId}`, {path, name});
}

export async function pluginDiskCopy(sourceId: string, from: string, to: string) {
  return usePut(`/api/plugin/disk/copy/${sourceId}`, {from, to});
}

export async function pluginDiskMove(sourceId: string, from: string, to: string) {
  return usePut(`/api/plugin/disk/move/${sourceId}`, {from, to});
}