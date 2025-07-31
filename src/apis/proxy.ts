import { AxiosRequestConfig } from "axios";
import { HttpConfig, usePost } from "@/apis/common";

export function proxyHttp<T>(
  config: AxiosRequestConfig,
  httpConfig?: HttpConfig
) {
  return usePost<T>("/api/proxy/http", config, httpConfig);
}

export function proxyUrl(url: string, filename: string): string {
  return `/api/proxy/url/${filename}?url=${encodeURIComponent(url)}`;
}
