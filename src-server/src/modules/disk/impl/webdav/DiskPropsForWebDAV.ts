import {CustomForm} from "@/types/CustomForm";

export const DiskPropsForWebDAV: Array<CustomForm> = [{
  type: 'input',
  label: 'URL',
  field: 'url',
  placeholder: 'https://example.com/webdav/',
  required: true,
}, {
  type: 'input',
  label: '用户名',
  field: 'username',
  placeholder: '用户名',
  required: true,
}, {
  type: 'password',
  label: '密码',
  field: 'password',
  placeholder: '密码',
  required: true,
}, {
  type: 'select',
  label: '认证方式',
  field: 'type',
  options: [{
    label: '自动',
    value: 'auto'
  }, {
    label: '无',
    value: 'none'
  }, {
    label: '密码',
    value: 'password'
  }, {
    label: 'token',
    value: 'token'
  }, {
    label: '摘要',
    value: 'digest'
  }],
  defaultValue: 'auto'
}]