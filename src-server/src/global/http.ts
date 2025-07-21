import axios, { AxiosRequestConfig } from "axios";
import https from "node:https";

export const http = axios.create({
  adapter: "http",
  timeout: 15000,
  httpsAgent: new https.Agent({ rejectUnauthorized: true }),
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  },
});

export function useRequest<T>(url: string, config?: AxiosRequestConfig) {
  const _config: AxiosRequestConfig = {
    url: url,
    ...config,
  };
  // TODO: 代理设置
  // const {proxy} = useBaseSettingStore.value;
  // if (proxy && proxy.isEnabled) {
  //   _config.proxy = {
  //     protocol: proxy.protocol,
  //     host: proxy.host,
  //     port: proxy.port,
  //   }
  //   if (proxy.username && proxy.password) {
  //     _config.proxy.auth = {
  //       username: proxy.username,
  //       password: proxy.password
  //     }
  //   }
  // }
  return http.request<T>(_config);
}

export function useHead<T = any>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig
) {
  return useRequest<T>(url, {
    params,
    ...config,
    method: "HEAD",
  });
}

export function useGet<T = any>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig
) {
  return useRequest<T>(url, {
    params,
    ...config,
    method: "GET",
  });
}

export function usePost<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
) {
  return useRequest<T>(url, {
    ...config,
    data,
    method: "POST",
  });
}
