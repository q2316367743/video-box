import axios, {AxiosRequestConfig} from "axios";
import https from "node:https";
import {settingDao} from "@/dao";
import {SettingConstantEnum} from "@/enum/SettingConstantEnum";

export const http = axios.create({
  adapter: "http",
  timeout: 15000,
  httpsAgent: new https.Agent({rejectUnauthorized: true}),
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  },
});

export async function useRequest<T>(url: string, config?: AxiosRequestConfig) {
  const _config: AxiosRequestConfig = {
    url: url,
    ...config,
  };
  // 代理设置
  const enabled = await settingDao.get(SettingConstantEnum.PROXY_ENABLE);
  if (enabled) {
    const protocol = await settingDao.get<string>(SettingConstantEnum.PROXY_PROTOCOL);
    const host = await settingDao.get<string>(SettingConstantEnum.PROXY_HOST);
    const port = await settingDao.get<number>(SettingConstantEnum.PROXY_PORT);
    const username = await settingDao.get<string>(SettingConstantEnum.PROXY_USERNAME);
    const password = await settingDao.get<string>(SettingConstantEnum.PROXY_PASSWORD);
    if (protocol && host && port) {
      _config.proxy = {
        protocol: protocol,
        host: host,
        port: port,
      }
      if (username && password) {
        _config.proxy.auth = {
          username: username,
          password: password
        }
      }
    }
  }
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
