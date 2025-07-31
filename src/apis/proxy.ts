import {AxiosRequestConfig} from "axios";
import {HttpConfig, usePost} from "@/apis/common";
import {useUserStore} from "@/store/UserStore.ts";

export function proxyHttp<T>(
  config: AxiosRequestConfig,
  httpConfig?: HttpConfig
) {
  return usePost<T>("/api/proxy/http", config, httpConfig);
}

export function proxyUrl(url: string, filename: string): string {
  const {token} = useUserStore();
  return `/api/proxy/url/${filename}?url=${encodeURIComponent(url)}&authorization=${token}`;
}


export function proxyDiskP(id: string, path: string, sign: string): string {
  const {token} = useUserStore();
  return `/api/proxy/disk/${id}/p${path}?sign=${sign}&authorization=${token}`;
}
