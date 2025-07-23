import {AxiosRequestConfig, AxiosResponse} from "axios";
import {HttpConfig, usePost} from "@/apis/common.js";

export function proxyHttp<T>(config: AxiosRequestConfig, httpConfig?: HttpConfig) {
  return usePost<T>('/api/proxy/http', config, httpConfig);
}

export function proxyUrl(url: string): string {
  return `/api/proxy/url/${encodeURIComponent(url)}`
}