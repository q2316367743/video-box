import axios, {AxiosRequestConfig} from "axios";
import {useBaseSettingStore} from "@/store/index.js";

export function useRequest<T>(url: string, config?: AxiosRequestConfig) {
  const _config: AxiosRequestConfig = {
    url: url,
    ...config
  };
  const {proxy} = useBaseSettingStore.value;
  if (proxy && proxy.isEnabled) {
    _config.proxy = {
      protocol: proxy.protocol,
      host: proxy.host,
      port: proxy.port,
    }
    if (proxy.username && proxy.password) {
      _config.proxy.auth = {
        username: proxy.username,
        password: proxy.password
      }
    }
  }
  if (config && (config.adapter === 'fetch' || config.adapter === 'xhr')) {
    // 指定使用fetch才会使用自定义的
    return axios.request<T>(_config)
  }
  return window.preload.lib.axiosInstance.request<T>(_config);
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

