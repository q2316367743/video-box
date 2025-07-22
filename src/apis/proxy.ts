import {AxiosRequestConfig, AxiosResponse} from "axios";
import {usePost} from "@/apis/common.js";

export function proxyHttp<T>(config: AxiosRequestConfig) {
  return usePost<T>('/api/proxy/http', config);
}