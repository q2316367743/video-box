import * as crypto from "node:crypto";
import axios from "axios";
import {HTTP_USER_AGENT} from "@/global/constant";
import {DiskPluginForQuarkOpen} from "@/modules/disk/impl/quark-open/driver";

const baseURL = 'https://open-api-drive.quark.cn';

interface ReqSign {
  timestamp: number;
  xPanToken: string;
  reqId: string;
}

export interface DiskFromQuarkOpen {
  OrderBy: string;
  OrderDirection: string;
  UseOnlineAPI: string;
  APIAddress: string;
  AccessToken: string;
  RefreshToken: string;
  AppID: string;
  SignKey: string;
}

function generateReqSign(method: string, pathname: string, signKey: string): ReqSign {
  const timestamp = Date.now();
  // 生成 x-pan-token token的组成是: method + "&" + pathname + "&" + timestamp + "&" + signKey
  const tokenData = `${method}&${pathname}&${timestamp}&${signKey}`;
  const xPanToken = crypto.createHash('sha256').update(tokenData).digest('hex');

  const reqId = crypto.randomUUID();
  return {timestamp, xPanToken, reqId};

}

export async function requestByQuarkOpen(
  pathname: string,
  method: string,
  config: DiskFromQuarkOpen,
  instance: DiskPluginForQuarkOpen,
  sign?: ReqSign
) {
  const {timestamp, xPanToken, reqId} = sign || generateReqSign(method, pathname, config.SignKey);

  const rsp = await axios.request({
    baseURL,
    url: pathname,
    headers: {
      "Accept": "application/json, text/plain, */*",
      "User-Agent": HTTP_USER_AGENT,
      'x-pan-tm': timestamp,
      'x-pan-token': xPanToken,
      'x-pan-client-id': config.AppID,
    },
    params: {
      'req_id': reqId,
      'access_token': config.AccessToken,
    }
  });
  const { data} = rsp;
  // 判断 是否需要 刷新 access_token
  if (rsp.status === -1 && (data.errno === 11001 || (data.errno === 14001 && (data.errorinfo as string).includes('access_token')))) {

  }
}