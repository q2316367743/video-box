import {CustomForm} from "@/types/CustomForm";

export interface DiskFormBaiduNetDisk {
  OrderBy: string;
  OrderDirection: string;
  DownloadAPI: string;
  UseOnlineAPI: boolean;
  APIAddress: string;
  ClientID: string;
  ClientSecret: string;
  CustomCrackUA: string;
  AccessToken: string;
  RefreshToken: string;
  UploadThread: number;
  UploadAPI: string;
  CustomUploadPartSize: number;
  LowBandwithUploadMode: boolean;
  OnlyListVideoFile: boolean;
}

export const DiskPropsForBaiduNetDisk: Array<CustomForm> = [{
  type: 'select',
  label: '排序',
  field: 'OrderBy',
  options: [{
    label: '文件名',
    value: 'name'
  }, {
    label: '修改时间',
    value: 'time'
  }, {
    label: '大小',
    value: 'size'
  }],
  defaultValue: 'name'
}, {
  type: 'select',
  label: '排序方向',
  field: 'OrderDirection',
  options: [{
    label: '升序',
    value: 'asc'
  }, {
    label: '降序',
    value: 'desc'
  }],
  defaultValue: 'asc'
}, {
  type: 'select',
  label: '下载API',
  field: 'DownloadAPI',
  options: [{
    label: "official",
    value: "official"
  }, {
    label: "crack",
    value: "crack"
  }, {
    label: "crack_video",
    value: "crack_video"
  }],
  defaultValue: 'official'
}, {
  type: 'switch',
  label: '使用在线API',
  field: 'UseOnlineAPI',
  defaultValue: true
}, {
  type: 'input',
  label: 'API地址',
  field: 'APIAddress',
  defaultValue: 'https://api.oplist.org/baiduyun/renewapi'
}, {
  type: 'input',
  label: '客户端ID',
  field: 'ClientID',
  defaultValue: ''
}, {
  type: 'input',
  label: '客户端密钥',
  field: 'ClientSecret',
}, {
  type: 'input',
  label: 'CustomCrackUA',
  field: 'CustomCrackUA',
  defaultValue: 'netdisk'
}, {
  type: 'input',
  label: 'AccessToken',
  field: 'AccessToken',
  defaultValue: ''
}, {
  type: 'input',
  label: 'RefreshToken',
  field: 'RefreshToken',
  defaultValue: ''
}, {
  type: 'number',
  label: '上传线程数',
  field: 'UploadThread',
  defaultValue: 3,
  help: '1<=thread<=32'
}, {
  type: 'input',
  label: '上传API',
  field: 'UploadAPI',
  defaultValue: 'https://d.pcs.baidu.com'
}, {
  type: 'number',
  label: '自定义分片大小',
  field: 'CustomUploadPartSize',
  defaultValue: 0,
  help: '0 for auto'
}, {
  type: 'switch',
  label: '低带宽上传模式',
  field: 'LowBandwithUploadMode',
  defaultValue: false
}, {
  type: 'switch',
  label: '仅列出视频文件',
  field: 'OnlyListVideoFile',
  defaultValue: false
}
]