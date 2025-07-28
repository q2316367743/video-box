export enum SettingConstantEnum {
  PROXY_ENABLE = '/proxy/enable',
  PROXY_PROTOCOL = '/proxy/protocol',
  PROXY_HOST = '/proxy/host',
  PROXY_PORT = '/proxy/port',
  PROXY_USERNAME = '/proxy/username',
  PROXY_PASSWORD = '/proxy/password',
}

export const SettingConstants: Array<string> = [
  SettingConstantEnum.PROXY_ENABLE,
  SettingConstantEnum.PROXY_PROTOCOL,
  SettingConstantEnum.PROXY_HOST,
  SettingConstantEnum.PROXY_PORT,
  SettingConstantEnum.PROXY_USERNAME,
  SettingConstantEnum.PROXY_PASSWORD,
]