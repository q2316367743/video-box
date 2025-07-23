import axios, {AxiosRequestConfig} from "axios";
import MessageUtil from "@/utils/modal/MessageUtil.js";

interface Result<T> {
  code: number;
  msg: string;
  data: T;
}

const http = axios.create({
  timeout: 10000,
});

export interface HttpConfig extends AxiosRequestConfig {
  ignoreError?: boolean;
}

export async function useRequest<T>(url: string, config?: HttpConfig): Promise<T> {
  const {data} = await http.request<Result<T>>({
    ...config,
    url,
  });
  if (config && config.responseType === 'text') {
    // 字符串
    // @ts-ignore
    return data;
  }
  if (typeof data === 'string') {
    if (!config?.ignoreError) {
      MessageUtil.error("请求失败", data);
    }
    return Promise.reject(new Error(data));
  }
  if (data.code !== 200) {
    if (!config?.ignoreError) {
      MessageUtil.error("请求失败", data.msg);
    }
    return Promise.reject(new Error(data.msg));
  }
  return data.data;
}

export function useHead<T = any>(url: string, params?: any, config?: HttpConfig) {
  return useRequest<T>(url, {
    params,
    ...config,
    method: 'HEAD'
  })
}

export function useGet<T = any>(url: string, params?: any, config?: HttpConfig) {
  return useRequest<T>(url, {
    params,
    ...config,
    method: 'GET'
  })
}

export function usePost<T = any>(url: string, data?: any, config?: HttpConfig) {
  return useRequest<T>(url, {
    ...config,
    data,
    method: 'POST'
  })
}

export function usePut<T = any>(url: string, data?: any, config?: HttpConfig) {
  return useRequest<T>(url, {
    ...config,
    data,
    method: 'PUT'
  })
}


export function useDelete<T = any>(url: string, data?: any, config?: HttpConfig) {
  return useRequest<T>(url, {
    ...config,
    data,
    method: 'DELETE'
  })
}
