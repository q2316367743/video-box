import axios, {AxiosRequestConfig} from "axios";

export function useRequest<T>(url: string, config?: AxiosRequestConfig) {
  const _config = {
    url: url,
    ...config
  };
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

