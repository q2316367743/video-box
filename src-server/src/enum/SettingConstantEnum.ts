import {CustomForm} from "@/types/CustomForm";

export enum SettingConstantEnum {
  PROXY_ENABLE = '/proxy/enable',
  PROXY_PROTOCOL = '/proxy/protocol',
  PROXY_HOST = '/proxy/host',
  PROXY_PORT = '/proxy/port',
  PROXY_USERNAME = '/proxy/username',
  PROXY_PASSWORD = '/proxy/password',

  SUBSCRIBE_AI = '/subscribe/ai',
  SUBSCRIBE_MODEL = '/subscribe/model'
}

export const SettingConstants: Array<string> = [
  SettingConstantEnum.PROXY_ENABLE,
  SettingConstantEnum.PROXY_PROTOCOL,
  SettingConstantEnum.PROXY_HOST,
  SettingConstantEnum.PROXY_PORT,
  SettingConstantEnum.PROXY_USERNAME,
  SettingConstantEnum.PROXY_PASSWORD,
]

export const settingForm: Array<CustomForm> = [{
  type: 'switch',
  label: '代理',
  field: SettingConstantEnum.PROXY_ENABLE,
  placeholder: '是否启用代理'
}, {
  type: 'select',
  label: '代理协议',
  field: SettingConstantEnum.PROXY_PROTOCOL,
  placeholder: '代理协议',
  options: [{
    label: 'http',
    value: 'http'
  }, {
    label: 'https',
    value: 'https'
  }]
}, {
  type: 'input',
  label: '代理地址',
  field: SettingConstantEnum.PROXY_HOST,
  placeholder: '代理地址'
}, {
  type: 'number',
  label: '代理端口',
  field: SettingConstantEnum.PROXY_PORT,
  placeholder: '代理端口'
}, {
  type: 'input',
  label: '代理用户名',
  field: SettingConstantEnum.PROXY_USERNAME,
  placeholder: '代理用户名'
}, {
  type: 'password',
  label: '代理密码',
  field: SettingConstantEnum.PROXY_PASSWORD,
  placeholder: '代理密码'
}, {
  type: 'switch',
  label: 'AI订阅',
  field: SettingConstantEnum.SUBSCRIBE_AI,
  placeholder: '是否启用AI订阅'
}, {
  type: 'select',
  label: 'AI模型',
  field: SettingConstantEnum.SUBSCRIBE_MODEL,
  placeholder: 'AI模型',
  options: [{
    label: 'gpt-3.5-turbo',
    value: 'gpt-3.5-turbo'
  }, {
    label: 'gpt-4',
    value: 'gpt-4'
  }]
}]