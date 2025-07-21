import axios, {AxiosRequestConfig} from "axios";
import MessageUtil from "@/utils/modal/MessageUtil.js";

interface Result<T> {
  code: number;
  msg: string;
  data: T;
}

const http = axios.create({
  timeout: 5000,
});

export async function useRequest<T>(url: string, config?: AxiosRequestConfig) {
  const {data} = await http.request<Result<T>>({
    ...config,
    url,
  });
  if (data.code !== 200) {
    MessageUtil.error("请求失败", data.msg);
    return Promise.reject(new Error(data.msg));
  }
  return data.data;
}

export function useHead<T = any>(url: string, params?: any, config?: AxiosRequestConfig) {
  return useRequest<T>(url, {
    params,
    ...config,
    method: 'HEAD'
  })
}

export function useGet<T = any>(url: string, params?: any, config?: AxiosRequestConfig) {
  return useRequest<T>(url, {
    params,
    ...config,
    method: 'GET'
  })
}

export function usePost<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
  return useRequest<T>(url, {
    ...config,
    data,
    method: 'POST'
  })
}


export function usePut<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
  return useRequest<T>(url, {
    ...config,
    data,
    method: 'PUT'
  })
}
