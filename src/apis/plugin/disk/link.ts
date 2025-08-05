import {useDelete, useGet, usePost, usePut} from "@/apis/common.ts";
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

export async function pluginDiskRm(sourceId: string, path: string) {
  return useDelete(`/api/plugin/disk/rm/${sourceId}`, {path});
}

export async function pluginDiskMkdir(sourceId: string, path: string, name: string) {
  return usePost(`/api/plugin/disk/mkdir/${sourceId}`, {path, name});
}

export async function pluginDiskUpload(sourceId: string, path: string, file: File, overwrite: boolean) {
  return fetch(`/api/plugin/disk/upload/${sourceId}`, {
    method: 'POST',
    body: file,
    headers: {
      authorization: useUserStore().token,
      'Folder-Path': encodeURIComponent(path),
      'File-Name': encodeURIComponent(file.name),
      'File-Type': file.type,
      'Content-Type': 'application/octet-stream',
      'Overwrite': `${overwrite}`,
      'Content-Length': `${file.size}`,
      'As-Task': 'false',
      'X-File-Md5': '',
      'X-File-Sha1': '',
      'X-File-Sha256': ''
    }
  })
}